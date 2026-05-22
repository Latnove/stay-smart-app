import { ListingCard, ShortListingCard, type Listing } from '@/entities/listing'
import { FavoriteButton } from '@/features/favorites'
import { Pagination } from 'antd'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './ListingList.module.css'

interface IListingList {
  listings: Listing[]
  isShortCard: boolean
  className?: string
  total?: number
  pagination?: {
    page: number
    limit: number
    setPage: (page: number) => void
  }
}

export const ListingList: FC<IListingList> = ({ listings, isShortCard = true, pagination, total, className }) => {
  const Card = isShortCard ? ShortListingCard : ListingCard
  const visibleListings = pagination ? listings.slice(0, pagination.limit) : listings

  return (
    <div className={clsx(isShortCard && styles.grid, !isShortCard && styles.list, className)}>
      {visibleListings.map((el) => (
        <Card key={el.id} listing={el} className={styles.card}>
          <FavoriteButton listing={el} className={styles.favorite} />
        </Card>
      ))}

      {pagination && visibleListings.length > 0 && (
        <Pagination
          className={styles.pagination}
          current={pagination.page}
          total={total ?? listings.length}
          pageSize={pagination.limit}
          showSizeChanger={false}
          itemRender={(_, type, originalElement) => {
            if (type === 'prev' || type === 'next') {
              return null
            }
            return originalElement
          }}
          onChange={(page) => {
            pagination.setPage(page)
          }}
        />
      )}
    </div>
  )
}
