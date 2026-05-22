import type { Listing } from '@/entities/listing'
import type { AdminUser } from '@/entities/user'
import Tabs from 'antd/es/tabs'
import { AdminDocumentsPanel } from './AdminDocumentsPanel'
import { AdminListingsModerationPanel } from './AdminListingsModerationPanel'
import { AdminUsersPanel } from './AdminUsersPanel'
import styles from './AdminPanel.module.css'

interface AdminModerationTabsProps {
  pendingUsers: AdminUser[]
  pendingListings: Listing[]
  users: AdminUser[]
  onApproveListing: (listingId: string) => void
  onBlockUser: (userId: string, reason: string) => void
  onRejectListing: (listingId: string, reason: string) => void
  onRejectUserVerification: (userId: string, reason: string) => void
  onUnblockUser: (userId: string) => void
  onVerifyUser: (userId: string) => void
}

export const AdminModerationTabs = ({
  onApproveListing,
  onBlockUser,
  onRejectListing,
  onRejectUserVerification,
  onUnblockUser,
  onVerifyUser,
  pendingListings,
  pendingUsers,
  users,
}: AdminModerationTabsProps) => {
  return (
    <Tabs
      className={styles.tabs}
      items={[
        {
          key: 'verification',
          label: 'Документы',
          children: (
            <AdminDocumentsPanel
              users={pendingUsers}
              onVerifyUser={onVerifyUser}
              onRejectUserVerification={onRejectUserVerification}
            />
          ),
        },
        {
          key: 'users',
          label: 'Пользователи',
          children: <AdminUsersPanel users={users} onBlockUser={onBlockUser} onUnblockUser={onUnblockUser} />,
        },
        {
          key: 'listings',
          label: 'Объявления',
          children: (
            <AdminListingsModerationPanel
              listings={pendingListings}
              onApproveListing={onApproveListing}
              onRejectListing={onRejectListing}
            />
          ),
        },
      ]}
    />
  )
}
