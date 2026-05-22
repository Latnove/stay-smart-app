import z from 'zod'

export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Поставьте оценку').max(5, 'Максимальная оценка 5'),
  text: z.string().min(10, 'Минимальная длина отзыва 10 символов').max(500, 'Максимальная длина 500 символов'),
})

export type CreateReviewFormType = z.infer<typeof createReviewSchema>
