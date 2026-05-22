import type { Booking } from '@/entities/booking'
import type { Listing } from '@/entities/listing'
import type { Notification } from '@/entities/notification'
import type { Review } from '@/entities/review'
import type { AdminUser, User } from '@/entities/user'
import type { AdminUserDto, BookingDto, ListingDto, NotificationDto, ReviewDto, UserDto } from '@/shared/api'

export const mapUser = (user: UserDto): User => ({
  id: user.id ?? '',
  username: user.username ?? '',
  email: user.email ?? '',
  role: user.role ?? 'user',
  verified: user.verified ?? 'none',
  createdAt: user.createdAt ?? '',
  blocked: user.blocked ?? false,
  verificationReason: user.verificationReason,
  blockReason: user.blockReason,
})

export const mapAdminUser = (user: AdminUserDto): AdminUser => ({
  ...mapUser(user),
  documents: user.documents ?? [],
})

export const mapListing = (listing: ListingDto): Listing => ({
  id: listing.id ?? '',
  title: listing.title ?? '',
  description: listing.description ?? '',
  city: listing.city ?? '',
  address: listing.address ?? '',
  price: listing.price ?? 0,
  maxGuests: listing.maxGuests ?? 1,
  images: listing.images ?? [],
  rating: listing.rating ?? 0,
  type: listing.type ?? 'apartment',
  isOwner: listing.isOwner ?? false,
  ownerUsername: listing.ownerUsername ?? '',
  status: listing.status ?? 'review',
})

export const mapBooking = (booking: BookingDto): Booking => ({
  id: booking.id ?? '',
  listingId: booking.listingId ?? '',
  listing: booking.listing ? mapListing(booking.listing) : undefined,
  userId: booking.userId ?? '',
  user: booking.user ? mapUser(booking.user) : undefined,
  startDate: booking.startDate ?? '',
  endDate: booking.endDate ?? '',
  pricePerDay: booking.pricePerDay ?? 0,
  totalPrice: booking.totalPrice ?? 0,
  status: booking.status ?? 'active',
  createdAt: booking.createdAt ?? '',
  updatedAt: booking.updatedAt ?? '',
})

export const mapReview = (review: ReviewDto): Review => ({
  id: review.id ?? '',
  listingId: review.listingId ?? '',
  author: review.author ? mapUser(review.author) : mapUser({}),
  rating: review.rating ?? 0,
  text: review.text ?? '',
  createdAt: review.createdAt ?? '',
  updatedAt: review.updatedAt,
})

export const mapNotification = (notification: NotificationDto): Notification => ({
  id: notification.id ?? '',
  userId: notification.userId ?? '',
  type: notification.type ?? 'booking_created',
  title: notification.title ?? '',
  text: notification.text ?? '',
  link: notification.link ?? '',
  isRead: notification.isRead ?? false,
  createdAt: notification.createdAt ?? '',
})
