import { ListingCategoriesRecord, type ListingCategory } from '@/entities/listing'
import z from 'zod'

export const filtersSchema = z
  .object({
    city: z.string().min(2, 'Минимальная длина - 2 символа').nullable(),
    priceFrom: z.coerce.number().min(0, 'Цена не может быть отрицательной').nullable(),
    priceTo: z.coerce.number().max(100_000, 'Цена не может быть выше 100 тысяч').nullable(),
    minGuests: z.coerce.number().min(1, 'Минимум 1 гость').nullable(),
    rating: z.tuple([z.number().min(0, 'Минимум 0'), z.number().max(5, 'Максимум 5')]),
    category: z
      .enum(Object.keys(ListingCategoriesRecord) as [ListingCategory, ...ListingCategory[]])
      .array()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.priceFrom !== null && data.priceTo !== null && data.priceFrom > data.priceTo) {
      const message = 'Минимальная цена больше максимальной'

      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: ['priceFrom'] })
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: ['priceTo'] })
    }
  })

export type FiltersForm = z.infer<typeof filtersSchema>
