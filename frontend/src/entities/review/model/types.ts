import type { User } from '@/entities/user'

export interface Review {
  id: string

  listingId: string
  author: User

  rating: number
  text: string

  createdAt: string
  updatedAt?: string | null
}
