import type { ListingStatus } from '@/entities/listing'
import type { VerifiedType } from '@/entities/user'

export const verificationText: Record<VerifiedType, string> = {
  none: 'Не подтвержден',
  pending: 'На проверке',
  verified: 'Подтвержден',
  rejected: 'Отклонен',
}

export const listingStatusText: Record<ListingStatus, string> = {
  review: 'На проверке',
  active: 'Активное',
  blocked: 'Заблокировано',
}
