export type VerifiedType = 'none' | 'pending' | 'verified' | 'rejected'

export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  verified: VerifiedType
  createdAt: string
  blocked?: boolean
  verificationReason?: string
  blockReason?: string
}

export type AdminUser = User & {
  documents: string[]
}
