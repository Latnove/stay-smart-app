import { differenceInCalendarDays, format, isAfter, isBefore, isEqual, parseISO, startOfDay } from 'date-fns'

import type { Booking } from '@/entities/booking'

export const toDateKey = (date: Date) => {
  return format(date, 'yyyy-MM-dd')
}

export const canCancelBooking = (startDate: string) => {
  const bookingDay = startOfDay(parseISO(startDate))
  const today = startOfDay(new Date())

  return isAfter(bookingDay, today)
}

export const canChangeBookingPeriod = (startDate: string) => {
  const today = startOfDay(new Date())
  const bookingDay = startOfDay(parseISO(startDate))

  return isBefore(today, bookingDay)
}

export const getBookingDaysCount = (startDate: Date, endDate: Date) => {
  return differenceInCalendarDays(startOfDay(endDate), startOfDay(startDate)) + 1
}

export const isDateInsideBooking = (date: Date, booking: Booking) => {
  const currentDay = startOfDay(date)
  const bookingStartDay = startOfDay(parseISO(booking.startDate))
  const bookingEndDay = startOfDay(parseISO(booking.endDate))

  return (
    isEqual(currentDay, bookingStartDay) ||
    isEqual(currentDay, bookingEndDay) ||
    (isAfter(currentDay, bookingStartDay) && isBefore(currentDay, bookingEndDay))
  )
}

export const isRangeIntersectsBooking = (startDate: Date, endDate: Date, booking: Booking) => {
  const rangeStartDay = startOfDay(startDate)
  const rangeEndDay = startOfDay(endDate)

  const bookingStartDay = startOfDay(parseISO(booking.startDate))
  const bookingEndDay = startOfDay(parseISO(booking.endDate))

  return !isBefore(rangeEndDay, bookingStartDay) && !isAfter(rangeStartDay, bookingEndDay)
}

export const getBookingByDate = (bookings: Booking[], date: Date) => {
  return bookings.find((booking) => booking.status === 'active' && isDateInsideBooking(date, booking))
}

export const getMyBookings = (bookings: Booking[], userId: string) => {
  return bookings.filter((booking) => booking.userId === userId && booking.status === 'active')
}

export const getOtherBookings = (bookings: Booking[], userId: string) => {
  return bookings.filter((booking) => booking.userId !== userId && booking.status === 'active')
}
