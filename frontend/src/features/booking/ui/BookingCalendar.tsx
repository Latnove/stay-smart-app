import type { Booking } from '@/entities/booking'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Badge, Button, Flex, message, Modal, Select, Typography } from 'antd'
import { parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { FC } from 'react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

import {
  canCancelBooking,
  getBookingDaysCount,
  isDateInsideBooking,
  isRangeIntersectsBooking,
  toDateKey,
} from '../lib/helpers'

import styles from './BookingCalendar.module.css'

const { Text } = Typography

type BookingCalendarMode = 'booking' | 'edit'

type BookingRangePayload = {
  startDate: Date
  endDate: Date
  totalPrice: number
}

interface BookingCalendarProps {
  bookings: Booking[]
  currentUserId: string
  listingPrice: number
  mode?: BookingCalendarMode
  editableBookingId?: string
  initialRange?: Pick<Booking, 'startDate' | 'endDate'>

  onBook?: (range: BookingRangePayload) => Promise<void> | void
  onChangePeriod?: (range: BookingRangePayload) => Promise<void> | void

  onCancel?: (booking: Booking) => Promise<void> | void
}

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export const BookingCalendar: FC<BookingCalendarProps> = ({
  bookings,
  currentUserId,
  listingPrice,
  mode = 'booking',
  editableBookingId,
  initialRange,
  onBook,
  onChangePeriod,
  onCancel,
}) => {
  const isEditMode = mode === 'edit'
  const [month, setMonth] = useState(() => (initialRange ? parseISO(initialRange.startDate) : new Date()))
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() =>
    initialRange
      ? {
          from: parseISO(initialRange.startDate),
          to: parseISO(initialRange.endDate),
        }
      : undefined,
  )

  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled')

  const myBookings = activeBookings.filter(
    (booking) => booking.userId === currentUserId && (!isEditMode || booking.id !== editableBookingId),
  )

  const otherBookings = activeBookings.filter((booking) => booking.userId !== currentUserId)
  const busyBookings = isEditMode ? activeBookings.filter((booking) => booking.id !== editableBookingId) : otherBookings

  const currentYear = new Date().getFullYear()

  const years = Array.from({ length: 10 }, (_, index) => currentYear + index)

  const selectedStartDate = selectedRange?.from
  const selectedEndDate = selectedRange?.to

  const daysCount = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return 0

    return getBookingDaysCount(selectedStartDate, selectedEndDate)
  }, [selectedStartDate, selectedEndDate])

  const totalPrice = daysCount * listingPrice

  const selectedMyBooking = useMemo(() => {
    if (isEditMode || !selectedStartDate || !selectedEndDate) return undefined

    return myBookings.find((booking) => isRangeIntersectsBooking(selectedStartDate, selectedEndDate, booking))
  }, [isEditMode, myBookings, selectedStartDate, selectedEndDate])

  const hasBusyBooking = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return false

    return busyBookings.some((booking) => isRangeIntersectsBooking(selectedStartDate, selectedEndDate, booking))
  }, [busyBookings, selectedStartDate, selectedEndDate])

  const handleRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)

    if (!range?.from || !range?.to) return

    const hasBusyDates = busyBookings.some((booking) => isRangeIntersectsBooking(range.from!, range.to!, booking))

    if (hasBusyDates) {
      message.warning('В выбранном периоде есть занятые даты')
      setSelectedRange(undefined)
    }
  }

  const handleSubmit = () => {
    if (!selectedStartDate || !selectedEndDate) {
      message.warning('Выберите дату начала и окончания аренды')
      return
    }

    if (hasBusyBooking) {
      message.warning('В выбранном периоде есть занятые даты')
      return
    }

    if (isEditMode) {
      const startDateKey = toDateKey(selectedStartDate)
      const endDateKey = toDateKey(selectedEndDate)

      if (initialRange?.startDate === startDateKey && initialRange.endDate === endDateKey) {
        message.info('Период бронирования не изменился')
        return
      }

      Modal.confirm({
        title: 'Изменение срока аренды',
        content: `Изменить срок аренды с ${startDateKey} по ${endDateKey} за ${totalPrice} руб.?`,
        okText: 'Сохранить',
        cancelText: 'Отмена',
        async onOk() {
          await onChangePeriod?.({
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            totalPrice,
          })

          message.success('Срок аренды обновлен')
        },
      })

      return
    }

    if (selectedMyBooking) {
      if (!canCancelBooking(selectedMyBooking.startDate)) {
        message.warning('Эту бронь уже нельзя отменить')
        return
      }

      Modal.confirm({
        title: 'Отмена бронирования',
        content: 'Вы действительно хотите отменить эту бронь?',
        okText: 'Отменить бронь',
        cancelText: 'Закрыть',
        okButtonProps: {
          danger: true,
        },
        async onOk() {
          await onCancel?.(selectedMyBooking)
          message.success('Бронь успешно отменена')
          setSelectedRange(undefined)
        },
      })

      return
    }

    Modal.confirm({
      title: 'Подтверждение бронирования',
      content: `Забронировать жильё с ${toDateKey(selectedStartDate)} по ${toDateKey(
        selectedEndDate,
      )} за ${totalPrice} руб.?`,
      okText: 'Забронировать',
      cancelText: 'Отмена',
      async onOk() {
        await onBook?.({
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          totalPrice,
        })

        message.success('Жильё успешно забронировано')
        setSelectedRange(undefined)
      },
    })
  }

  const goPrevMonth = () => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const goNextMonth = () => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  const submitText = isEditMode ? 'Сохранить срок аренды' : selectedMyBooking ? 'Отменить бронь' : 'Забронировать'

  return (
    <Flex vertical gap={16}>
      <Flex gap={18} wrap='wrap' className={styles.legend}>
        <Badge color='var(--color-success)' text='Моя бронь' />
        <Badge color='var(--color-text-light)' text='Занято' />
        <Badge color='var(--color-primary)' text='Выбранный период' />
      </Flex>

      <div className={styles.calendarWrapper}>
        <div className={styles.calendarHeader}>
          <Button type='text' icon={<LeftOutlined />} onClick={goPrevMonth} className={styles.navigationButton} />

          <div className={styles.calendarSelects}>
            <Select
              value={month.getMonth()}
              options={MONTHS.map((label, value) => ({
                label,
                value,
              }))}
              onChange={(value) => {
                setMonth(new Date(month.getFullYear(), value))
              }}
            />

            <Select
              value={month.getFullYear()}
              options={years.map((year) => ({
                label: String(year),
                value: year,
              }))}
              onChange={(value) => {
                setMonth(new Date(value, month.getMonth()))
              }}
            />
          </div>

          <Button type='text' icon={<RightOutlined />} onClick={goNextMonth} className={styles.navigationButton} />
        </div>

        <DayPicker
          mode='range'
          locale={ru}
          month={month}
          onMonthChange={setMonth}
          selected={selectedRange}
          onSelect={handleRangeSelect}
          numberOfMonths={1}
          weekStartsOn={1}
          showOutsideDays
          disabled={[
            { before: new Date() },
            (date) => busyBookings.some((booking) => isDateInsideBooking(date, booking)),
          ]}
          modifiers={{
            myBooking: (date) => myBookings.some((booking) => isDateInsideBooking(date, booking)),
            booked: (date) => busyBookings.some((booking) => isDateInsideBooking(date, booking)),
          }}
          modifiersClassNames={{
            selected: styles.selectedDay,
            range_start: styles.rangeStart,
            range_end: styles.rangeEnd,
            range_middle: styles.rangeMiddle,
            myBooking: styles.myBookingDay,
            booked: styles.bookedDay,
            disabled: styles.disabledDay,
            outside: styles.outsideDay,
            today: styles.today,
          }}
          className={styles.dayPicker}
        />
      </div>

      <div className={styles.summary}>
        <div>
          <Text className={styles.summaryLabel}>Период</Text>
          <div className={styles.summaryValue}>
            {selectedStartDate && selectedEndDate
              ? `${toDateKey(selectedStartDate)} — ${toDateKey(selectedEndDate)}`
              : 'Выберите даты'}
          </div>
        </div>

        <div>
          <Text className={styles.summaryLabel}>Итого</Text>
          <div className={styles.summaryPrice}>{daysCount > 0 ? `${totalPrice} руб.` : '—'}</div>
        </div>
      </div>

      <Button
        type='primary'
        size='large'
        danger={Boolean(selectedMyBooking)}
        disabled={!selectedStartDate || !selectedEndDate || hasBusyBooking}
        onClick={handleSubmit}
        block
      >
        {submitText}
      </Button>

      <Text type='secondary' className={styles.hint}>
        {isEditMode ? 'Выбери новый период аренды.' : 'Выбери дату начала и дату окончания аренды.'}
      </Text>
    </Flex>
  )
}
