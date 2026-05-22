import type { Booking } from '@/entities/booking'
import type { User } from '@/entities/user'
import { cancelBooking, getListingBookings } from '@/shared/api'
import { declension, mapBooking, unwrapApi } from '@/shared/lib'
import { Tag } from '@/shared/ui/Tag/Tag'
import message from 'antd/es/message'
import Pagination from 'antd/es/pagination'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { isBefore, parseISO, startOfDay } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { OwnerListingRentalCard } from './OwnerListingRentalCard'
import styles from './OwnerListingRentals.module.css'

const PAGE_SIZE = 5

interface OwnerListingRentalsProps {
  listingId: string
  currentUser?: User | null
  className?: string
}

export const OwnerListingRentals = ({ listingId, currentUser, className }: OwnerListingRentalsProps) => {
  const [page, setPage] = useState(1)
  const [bookings, setBookings] = useState<Booking[]>([])
  const canManageRentals = Boolean(currentUser && (currentUser.role === 'admin' || currentUser.role === 'user'))

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await unwrapApi(
          getListingBookings({
            path: { listingId },
          }),
        )

        setBookings(response.map(mapBooking))
      } catch (error) {
        message.error(error instanceof Error ? error.message : 'Не удалось загрузить аренды')
      }
    }

    loadBookings()
  }, [listingId])

  const rentals = useMemo(() => {
    const today = startOfDay(new Date())

    return bookings
      .filter((booking) => booking.listingId === listingId)
      .filter((booking) => !isBefore(startOfDay(parseISO(booking.endDate)), today))
      .map((booking) => ({
        ...booking,
        status:
          booking.status === 'active' && !isBefore(today, startOfDay(parseISO(booking.startDate)))
            ? 'provided'
            : booking.status,
      }))
      .sort((firstBooking, secondBooking) => {
        return parseISO(firstBooking.startDate).getTime() - parseISO(secondBooking.startDate).getTime()
      })
  }, [bookings, listingId])

  const pageStart = (page - 1) * PAGE_SIZE
  const visibleRentals = rentals.slice(pageStart, pageStart + PAGE_SIZE)

  const handleCancel = async (bookingId: string) => {
    try {
      const booking = await unwrapApi(
        cancelBooking({
          path: { id: bookingId },
        }),
      )

      setBookings((prevBookings) => prevBookings.map((item) => (item.id === bookingId ? mapBooking(booking) : item)))
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось отменить аренду')
    }
  }

  if (rentals.length === 0) {
    return (
      <section className={clsx(styles.section, className)}>
        <div>
          <Title className={styles.title} level={2}>
            Ближайшие аренды
          </Title>
          <Text className={styles.subtitle}>Пока нет будущих или текущих аренд по этому объявлению.</Text>
        </div>
      </section>
    )
  }

  return (
    <section className={clsx(styles.section, className)}>
      <div className={styles.header}>
        <div>
          <Title className={styles.title} level={2}>
            Ближайшие аренды
          </Title>
          <Text className={styles.subtitle}>
            {rentals.length} {declension(rentals.length, 'аренда', 'аренды', 'аренд')} по этому объявлению
          </Text>
        </div>

        <Tag className={styles.counter}>По {PAGE_SIZE} на странице</Tag>
      </div>

      <div className={styles.list}>
        {visibleRentals.map((booking) => (
          <OwnerListingRentalCard
            key={booking.id}
            booking={booking}
            canCancel={canManageRentals}
            onCancel={handleCancel}
          />
        ))}
      </div>

      {rentals.length > PAGE_SIZE && (
        <Pagination
          className={styles.pagination}
          current={page}
          total={rentals.length}
          pageSize={PAGE_SIZE}
          showSizeChanger={false}
          itemRender={(_, type, originalElement) => {
            if (type === 'prev' || type === 'next') {
              return null
            }

            return originalElement
          }}
          onChange={setPage}
        />
      )}
    </section>
  )
}
