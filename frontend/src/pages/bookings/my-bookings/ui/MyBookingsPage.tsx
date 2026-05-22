import type { Booking } from '@/entities/booking'
import { selectUser, useUserStore } from '@/entities/user'
import { cancelBooking, changeBookingPeriod, getMyBookings } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { declension, mapBooking, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { Tag } from '@/shared/ui/Tag/Tag'
import { HeroSection } from '@/widgets/hero-section'
import message from 'antd/es/message'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { format, isBefore, parseISO, startOfDay } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { MyBookingCard } from './MyBookingCard'
import styles from './MyBookingsPage.module.css'

type PeriodPayload = {
  startDate: Date
  endDate: Date
  totalPrice: number
}

const toBookingDateKey = (date: Date) => format(date, 'yyyy-MM-dd')

const normalizeBookingStatus = (booking: Booking): Booking => ({
  ...booking,
  status:
    booking.status === 'active' && !isBefore(startOfDay(new Date()), startOfDay(parseISO(booking.startDate)))
      ? 'provided'
      : booking.status,
})

export const MyBookingsPage = () => {
  const navigate = useNavigate()
  const { user } = useUserStore(useShallow(selectUser))
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await unwrapApi(getMyBookings())
        setBookings(response.map(mapBooking).map(normalizeBookingStatus))
      } catch (error) {
        message.error(error instanceof Error ? error.message : 'Не удалось загрузить бронирования')
      }
    }

    loadBookings()
  }, [])

  const myBookings = useMemo(() => {
    if (!user) return []

    return bookings
      .filter((booking) => booking.userId === user.id)
      .sort((firstBooking, secondBooking) => {
        return parseISO(firstBooking.startDate).getTime() - parseISO(secondBooking.startDate).getTime()
      })
  }, [bookings, user])

  const activeBookings = myBookings.filter((booking) => booking.status === 'active')
  const providedBookingsCount = myBookings.filter((booking) => booking.status === 'provided').length
  const activeBookingsCount = activeBookings.length
  const activeTotalPrice = activeBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)

  const handlePeriodChange = async (bookingId: string, range: PeriodPayload) => {
    try {
      const booking = await unwrapApi(
        changeBookingPeriod({
          path: { id: bookingId },
          body: {
            startDate: toBookingDateKey(range.startDate),
            endDate: toBookingDateKey(range.endDate),
          },
        }),
      )

      setBookings((prevBookings) =>
        prevBookings.map((item) => (item.id === bookingId ? normalizeBookingStatus(mapBooking(booking)) : item)),
      )
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось изменить срок аренды')
      throw error
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const booking = await unwrapApi(
        cancelBooking({
          path: { id: bookingId },
        }),
      )

      setBookings((prevBookings) => prevBookings.map((item) => (item.id === bookingId ? mapBooking(booking) : item)))
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось отменить бронь')
      throw error
    }
  }

  return (
    <main className={styles.page}>
      <HeroSection
        tag='Бронирования'
        title='Мои забронированные места'
        text='Проверяйте даты, стоимость и детали жилья. Если аренда еще не началась, срок бронирования можно изменить.'
      />

      <section className={styles.listSection}>
        <div className={clsx('container', styles.container)}>
          <div className={styles.sectionHeader}>
            <div>
              <Title className={styles.sectionTitle} level={2}>
                Ваши бронирования
              </Title>
              <Text className={styles.sectionSubtitle}>
                Всего: {myBookings.length} {declension(myBookings.length, 'бронь', 'брони', 'броней')}, активных:{' '}
                {activeBookingsCount}, предоставлено: {providedBookingsCount}
              </Text>
            </div>

            <Tag className={styles.totalTag}>Сумма активных броней: {activeTotalPrice} руб.</Tag>
          </div>

          {myBookings.length === 0 ? (
            <div className={styles.empty}>
              <Text className={styles.emptyText}>У вас пока нет забронированных мест</Text>
              <ButtonField type='primary' isPrimary onClick={() => navigate(ROUTES.HOME.path)}>
                Перейти к каталогу
              </ButtonField>
            </div>
          ) : (
            <div className={styles.list}>
              {myBookings.map((booking) => (
                <MyBookingCard
                  key={booking.id}
                  booking={booking}
                  listingBookings={bookings.filter((item) => item.listingId === booking.listingId)}
                  currentUserId={user?.id ?? ''}
                  onPeriodChange={handlePeriodChange}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
