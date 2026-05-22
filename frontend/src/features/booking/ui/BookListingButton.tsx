import type { Booking } from '@/entities/booking'
import type { Listing } from '@/entities/listing'
import { selectUser, useUserStore } from '@/entities/user'

import { toDateKey } from '@/features/booking/lib/helpers'
import { BookingCalendar } from '@/features/booking/ui/BookingCalendar'
import { cancelBooking, createBooking, getListingBookings } from '@/shared/api'
import { isUUID, mapBooking, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'

import { CalendarOutlined } from '@ant-design/icons'
import message from 'antd/es/message'
import Modal from 'antd/es/modal'

import { useState, type FC } from 'react'
import { useShallow } from 'zustand/shallow'

interface IBookListingButton {
  listing: Listing
  className?: string
}

export const BookListingButton: FC<IBookListingButton> = ({ listing, className }) => {
  const { user } = useUserStore(useShallow(selectUser))
  const [open, setOpen] = useState(false)

  const [bookings, setBookings] = useState<Booking[]>([])

  const handleOpen = async () => {
    if (!isUUID(listing.id)) {
      console.error('Invalid UUID', listing.id)
      return
    }

    try {
      const response = await unwrapApi(
        getListingBookings({
          path: { listingId: listing.id },
        }),
      )

      setBookings(response.map(mapBooking))
      setOpen(true)
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Не удалось загрузить бронирования')
    }
  }

  if (!user || listing.isOwner) return null

  return (
    <>
      <ButtonField
        className={className}
        type='primary'
        size='large'
        icon={<CalendarOutlined />}
        block
        onClick={handleOpen}
      >
        Забронировать за {listing.price} руб.
      </ButtonField>

      <Modal open={open} onCancel={() => setOpen(false)} footer={null} title='Бронирование' centered>
        <BookingCalendar
          bookings={bookings}
          currentUserId={user.id}
          listingPrice={listing.price}
          onBook={async (date) => {
            try {
              const booking = await unwrapApi(
                createBooking({
                  path: { listingId: listing.id },
                  body: {
                    startDate: toDateKey(date.startDate),
                    endDate: toDateKey(date.endDate),
                  },
                }),
              )

              setBookings((prev) => [...prev, mapBooking(booking)])
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Не удалось забронировать')
              throw error
            }
          }}
          onCancel={async (booking) => {
            try {
              const cancelledBooking = await unwrapApi(
                cancelBooking({
                  path: { id: booking.id },
                }),
              )

              setBookings((prev) =>
                prev.map((item) => (item.id === booking.id ? mapBooking(cancelledBooking) : item)),
              )
            } catch (error) {
              message.error(error instanceof Error ? error.message : 'Не удалось отменить бронь')
              throw error
            }
          }}
        />
      </Modal>
    </>
  )
}
