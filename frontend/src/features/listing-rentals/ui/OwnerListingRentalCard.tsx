import type { Booking, BookingStatus } from '@/entities/booking'
import { CancelBookingButton } from '@/features/cancel-booking'
import { declension } from '@/shared/lib'
import { Tag } from '@/shared/ui/Tag/Tag'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  IdcardOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import styles from './OwnerListingRentalCard.module.css'

const statusText: Record<BookingStatus, string> = {
  active: 'Запланировано',
  cancelled: 'Отменена',
  provided: 'Предоставлено',
}

interface OwnerListingRentalCardProps {
  booking: Booking
  canCancel: boolean
  onCancel: (bookingId: string) => void
}

const formatDate = (date: string) => format(parseISO(date), 'dd MMMM yyyy', { locale: ru })

const getDaysCount = (booking: Booking) => {
  return differenceInCalendarDays(startOfDay(parseISO(booking.endDate)), startOfDay(parseISO(booking.startDate))) + 1
}

export const OwnerListingRentalCard = ({ booking, canCancel, onCancel }: OwnerListingRentalCardProps) => {
  const daysCount = getDaysCount(booking)
  const isCancelled = booking.status === 'cancelled'

  return (
    <article className={clsx(styles.card, isCancelled && styles.cancelledCard)}>
      <div className={styles.cardTop}>
        <div>
          <div className={styles.tags}>
            <Tag>{booking.id}</Tag>
            <Tag
              className={clsx(
                booking.status === 'active' && styles.statusActive,
                booking.status === 'provided' && styles.statusProvided,
                booking.status === 'cancelled' && styles.statusCancelled,
              )}
            >
              {statusText[booking.status]}
            </Tag>
          </div>

          <Text className={styles.period}>
            <CalendarOutlined />
            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </Text>
        </div>

        <div className={styles.right}>
          <Text className={styles.price}>{booking.totalPrice} руб.</Text>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.meta}>
          <span>
            <ClockCircleOutlined />
            {daysCount} {declension(daysCount, 'день', 'дня', 'дней')}
          </span>
          <span>
            <CreditCardOutlined />
            {booking.pricePerDay} руб. за ночь
          </span>
          <span>
            <UserOutlined />
            {booking.userId}
          </span>
          <span>
            <IdcardOutlined />
            {booking.listingId}
          </span>
        </div>

        <CancelBookingButton
          className={styles.cancelButton}
          booking={booking}
          canManage={canCancel}
          successText='Аренда отменена'
          onCancel={onCancel}
        />
      </div>
    </article>
  )
}
