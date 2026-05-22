// booking_created — пользователь забронировал жилье, уведомление получает владелец объявления.
// booking_cancelled — бронь отменили пользователь, владелец или администратор.
// booking_period_changed — пользователь изменил срок аренды до начала бронирования.
// review_updated — администратор изменил отзыв на странице объявления.
// user_verified — администратор подтвердил документы пользователя.
// user_verification_rejected — администратор отказал в верификации с причиной.
// user_blocked — администратор заблокировал пользователя с причиной.
// user_unblocked — администратор снял блокировку пользователя.
// listing_approved — администратор подтвердил объявление, и оно стало активным.
// listing_rejected — администратор вернул объявление в черновик с причиной.

export type NotificationType =
  | 'booking_created'
  | 'booking_cancelled'
  | 'booking_period_changed'
  | 'review_updated'
  | 'user_verified'
  | 'user_verification_rejected'
  | 'user_blocked'
  | 'user_unblocked'
  | 'listing_approved'
  | 'listing_rejected'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  text: string
  link: string
  isRead: boolean
  createdAt: string
}
