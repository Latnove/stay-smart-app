import type { Listing } from '@/entities/listing'
import type { User } from '@/entities/user'

export type BookingStatus = 'active' | 'cancelled' | 'provided'

export interface Booking {
  id: string

  listingId: string
  listing?: Listing
  userId: string
  user?: User

  startDate: string
  endDate: string

  pricePerDay: number
  totalPrice: number

  status: BookingStatus

  createdAt: string
  updatedAt: string
}
