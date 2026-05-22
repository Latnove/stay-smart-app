import type { Listing } from '@/entities/listing'
import { ReviewCard, type Review } from '@/entities/review'
import { CreateReview } from '@/features/create-review'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './ListingReviews.module.css'

interface IListingReviews {
  reviews: Review[]
  onUpdate: (review: Review) => void
  onCreate: (review: Review) => void
  myReview?: Review
  listingId: Listing['id']
  canEditAll?: boolean
  className?: string
}

export const ListingReviews: FC<IListingReviews> = ({
  reviews,
  className,
  listingId,
  myReview,
  onUpdate,
  onCreate,
  canEditAll,
}) => {
  return (
    <section className={clsx(styles.wrapper, className)}>
      <Title className={styles.title} level={2}>
        Отзывы ({reviews.length})
      </Title>

      <div className={styles.list}>
        <CreateReview listingId={listingId} review={myReview} onCreate={onCreate} onUpdate={onUpdate} />

        {reviews.map((review) =>
          canEditAll ? (
            <CreateReview
              key={review.id}
              listingId={listingId}
              review={review}
              badgeText='Отзыв пользователя'
              onCreate={onCreate}
              onUpdate={onUpdate}
            />
          ) : (
            <ReviewCard key={review.id} review={review} />
          ),
        )}
      </div>
    </section>
  )
}
