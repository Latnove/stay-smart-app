import type { Booking, BookingStatus } from '@/entities/booking'
import { ListingCategoriesRecord } from '@/entities/listing'
import { ChangeBookingPeriodButton } from '@/features/booking'
import { CancelBookingButton } from '@/features/cancel-booking'
import { ROUTES } from '@/shared/config'
import { declension } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { Tag } from '@/shared/ui/Tag/Tag'
import {
  ArrowRightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  IdcardOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { isBefore, parseISO, startOfDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { formatDate, formatDateTime, getBookingDaysCount, getListingPath } from '../lib/bookingCard'
import { BookingMetaItem } from './BookingMetaItem'
import styles from './MyBookingCard.module.css'

const bookingStatusText: Record<BookingStatus, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  provided: 'Предоставлена',
}

type PeriodPayload = {
  startDate: Date
  endDate: Date
  totalPrice: number
}

interface MyBookingCardProps {
  booking: Booking
  listingBookings: Booking[]
  currentUserId: string
  onPeriodChange: (bookingId: string, range: PeriodPayload) => void
  onCancel: (bookingId: string) => void
}

export const MyBookingCard = ({
  booking,
  listingBookings,
  currentUserId,
  onPeriodChange,
  onCancel,
}: MyBookingCardProps) => {
  const navigate = useNavigate()
  const listing = booking.listing
  const daysCount = getBookingDaysCount(booking)
  const listingPath = listing ? getListingPath(listing.id) : ROUTES.HOME.path
  const status =
    booking.status === 'active' && !isBefore(startOfDay(new Date()), startOfDay(parseISO(booking.startDate)))
      ? 'provided'
      : booking.status
  const isCancelled = status === 'cancelled'

  return (
    <article className={clsx(styles.card, isCancelled && styles.inactiveCard)}>
      <div className={styles.image}>
        {listing?.images[0] ? (
          <img src={listing.images[0]} alt={listing.title} />
        ) : (
          <div className={styles.imageFallback}>Фото не найдено</div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.cardHeader}>
          <div className={styles.titleBlock}>
            <div className={styles.tags}>
              <Tag>{booking.id}</Tag>
              <Tag
                className={clsx(
                  status === 'active' && styles.statusActive,
                  status === 'cancelled' && styles.statusCancelled,
                  status === 'provided' && styles.statusProvided,
                )}
              >
                {bookingStatusText[status]}
              </Tag>
              {listing && <Tag className={styles.category}>{ListingCategoriesRecord[listing.type].text}</Tag>}
            </div>

            <Title className={styles.cardTitle} level={3}>
              {listing?.title ?? 'Объявление не найдено'}
            </Title>

            <Text className={styles.address}>
              <EnvironmentOutlined />
              {listing ? `${listing.city}, ${listing.address}` : `ID объявления: ${booking.listingId}`}
            </Text>
          </div>

          <div className={styles.priceBox}>
            <Text className={styles.priceLabel}>Итого</Text>
            <Text className={clsx(styles.price, isCancelled && styles.cancelledPrice)}>{booking.totalPrice} руб.</Text>
          </div>
        </div>

        {listing && (
          <div className={styles.listingMeta}>
            <span>
              <HomeOutlined />
              {listing.city}
            </span>
            <span>
              <TeamOutlined />
              {listing.maxGuests} {declension(listing.maxGuests, 'гость', 'гостя', 'гостей')}
            </span>
            <span>
              <StarFilled />
              {listing.rating.toFixed(1)} из 5
            </span>
          </div>
        )}

        <div className={styles.metaGrid}>
          <BookingMetaItem
            icon={<CalendarOutlined />}
            label='Срок аренды'
            value={`${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}`}
          />
          <BookingMetaItem
            icon={<ClockCircleOutlined />}
            label='Длительность'
            value={`${daysCount} ${declension(daysCount, 'день', 'дня', 'дней')}`}
          />
          <BookingMetaItem icon={<CreditCardOutlined />} label='Цена за ночь' value={`${booking.pricePerDay} руб.`} />
          <BookingMetaItem
            icon={<CreditCardOutlined />}
            label='Сумма брони'
            value={`${booking.totalPrice} руб.`}
            accent
          />
          <BookingMetaItem icon={<IdcardOutlined />} label='ID брони' value={booking.id} />
          <BookingMetaItem icon={<HomeOutlined />} label='ID объявления' value={booking.listingId} />
          <BookingMetaItem icon={<UserOutlined />} label='ID пользователя' value={booking.userId} />
          <BookingMetaItem icon={<ClockCircleOutlined />} label='Создано' value={formatDateTime(booking.createdAt)} />
          <BookingMetaItem icon={<ClockCircleOutlined />} label='Обновлено' value={formatDateTime(booking.updatedAt)} />
        </div>

        <div className={styles.actions}>
          <CancelBookingButton className={styles.actionButton} booking={booking} onCancel={onCancel} />

          <ChangeBookingPeriodButton
            className={styles.actionButton}
            booking={booking}
            bookings={listingBookings}
            currentUserId={currentUserId}
            onPeriodChange={onPeriodChange}
          />

          <ButtonField
            type='primary'
            isPrimary
            className={styles.actionButton}
            icon={<ArrowRightOutlined />}
            disabled={!listing}
            onClick={() => navigate(listingPath)}
          >
            Перейти на объявление
          </ButtonField>
        </div>
      </div>
    </article>
  )
}
