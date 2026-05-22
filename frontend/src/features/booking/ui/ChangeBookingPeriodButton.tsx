import type { Booking } from '@/entities/booking'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { CalendarOutlined } from '@ant-design/icons'
import type { ButtonProps } from 'antd'
import Modal from 'antd/es/modal'
import Tooltip from 'antd/es/tooltip'
import { useState } from 'react'
import { canChangeBookingPeriod } from '../lib/helpers'
import { BookingCalendar } from './BookingCalendar'

type PeriodPayload = {
  startDate: Date
  endDate: Date
  totalPrice: number
}

interface ChangeBookingPeriodButtonProps extends ButtonProps {
  booking: Booking
  bookings: Booking[]
  currentUserId: string
  onPeriodChange: (bookingId: string, range: PeriodPayload) => Promise<void> | void
}

export const ChangeBookingPeriodButton = ({
  booking,
  bookings,
  currentUserId,
  onPeriodChange,
  className,
  ...props
}: ChangeBookingPeriodButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const status = booking.status === 'active' && !canChangeBookingPeriod(booking.startDate) ? 'provided' : booking.status
  const canEdit = status === 'active' && canChangeBookingPeriod(booking.startDate)
  const disabledReason = canEdit
    ? undefined
    : status === 'cancelled'
      ? 'Отмененную бронь нельзя изменить'
      : status === 'provided'
        ? 'Аренда уже началась'
        : 'Срок можно изменить только до дня начала аренды'

  const handleChangePeriod = async (range: PeriodPayload) => {
    await onPeriodChange(booking.id, range)
    setIsOpen(false)
  }

  return (
    <>
      <Tooltip title={disabledReason}>
        <span>
          <ButtonField
            {...props}
            className={className}
            disabled={!canEdit}
            icon={<CalendarOutlined />}
            onClick={() => setIsOpen(true)}
          >
            Изменить срок аренды
          </ButtonField>
        </span>
      </Tooltip>

      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        title='Изменение срока аренды'
        centered
        destroyOnHidden
      >
        <BookingCalendar
          mode='edit'
          bookings={bookings}
          currentUserId={currentUserId}
          listingPrice={booking.pricePerDay}
          editableBookingId={booking.id}
          initialRange={{
            startDate: booking.startDate,
            endDate: booking.endDate,
          }}
          onChangePeriod={handleChangePeriod}
        />
      </Modal>
    </>
  )
}
