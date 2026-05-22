import type { Review } from '@/entities/review'
import type { User } from '@/entities/user'
import { createReview as apiCreateReview } from '@/shared/api'
import { mapReview, unwrapApi } from '@/shared/lib'
import type { CreateReviewFormType } from '../lib/validation'

interface CreateReviewParams extends CreateReviewFormType {
  listingId: string
}

export const createReview = async (values: CreateReviewParams, user: User): Promise<Review> => {
  const review = await unwrapApi(
    apiCreateReview({
      path: { listingId: values.listingId },
      body: {
        rating: values.rating,
        text: values.text,
      },
    }),
  )

  return {
    ...mapReview(review),
    author: review.author ? mapReview(review).author : user,
  }
}
