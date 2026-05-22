import { ListingCard, type Listing } from '@/entities/listing'
import { ApproveListingButton, RejectListingButton } from '@/features/moderate-listing'
import Text from 'antd/es/typography/Text'
import type { MouseEvent } from 'react'
import styles from './AdminPanel.module.css'

interface AdminListingsModerationPanelProps {
  listings: Listing[]
  onApproveListing: (listingId: string) => void
  onRejectListing: (listingId: string, reason: string) => void
}

export const AdminListingsModerationPanel = ({
  listings,
  onApproveListing,
  onRejectListing,
}: AdminListingsModerationPanelProps) => {
  const handleActionsClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className={styles.list}>
      {listings.length === 0 && (
        <div className={styles.empty}>
          <Text>Нет объявлений на проверке</Text>
        </div>
      )}

      {listings.map((listing) => (
        <ListingCard className={styles.moderationListingCard} listing={listing} key={listing.id}>
          <div className={styles.listingModerationActions} onClick={handleActionsClick}>
            <ApproveListingButton listingId={listing.id} onApprove={onApproveListing} />
            <RejectListingButton listingId={listing.id} onReject={onRejectListing} />
          </div>
        </ListingCard>
      ))}
    </div>
  )
}
