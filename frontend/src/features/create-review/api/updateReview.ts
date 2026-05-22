import type { Review } from '@/entities/review'
import { updateReview as apiUpdateReview } from '@/shared/api'
import { mapReview, unwrapApi } from '@/shared/lib'
import type { CreateReviewFormType } from '../lib/validation'

interface UpdateReviewParams extends CreateReviewFormType {
  listingId: string
  review: Review
}

export const updateReview = async ({ review, rating, text }: UpdateReviewParams): Promise<Review> => {
  return mapReview(
    await unwrapApi(
      apiUpdateReview({
        path: { id: review.id },
        body: {
          rating,
          text,
        },
      }),
    ),
  )
}
