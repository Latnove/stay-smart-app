import type { Booking } from '@/entities/booking'
import { ROUTES } from '@/shared/config'
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatDate = (date: string) => format(parseISO(date), 'dd MMMM yyyy', { locale: ru })

export const formatDateTime = (date: string) => format(parseISO(date), 'dd MMM yyyy, HH:mm', { locale: ru })

export const getBookingDaysCount = (booking: Booking) => {
  return differenceInCalendarDays(startOfDay(parseISO(booking.endDate)), startOfDay(parseISO(booking.startDate))) + 1
}

export const getListingPath = (listingId: string) => ROUTES.LISTING_DETAILS.path.replace(':listingId', listingId)
