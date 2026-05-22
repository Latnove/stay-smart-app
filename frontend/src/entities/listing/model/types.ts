export const ListingCategoriesRecord: Record<string, { text: string }> = {
  apartment: {
    text: 'Квартира',
  },
  house: {
    text: 'Дом',
  },
  room: {
    text: 'Комната',
  },
} as const

export type ListingCategory = keyof typeof ListingCategoriesRecord
export type ListingStatus = 'review' | 'active' | 'blocked'

export type Listing = {
  id: string
  title: string
  description: string
  city: string
  address: string
  price: number
  maxGuests: number
  images: string[]
  rating: number
  type: ListingCategory
  isOwner: boolean
  ownerUsername: string
  status: ListingStatus
}
