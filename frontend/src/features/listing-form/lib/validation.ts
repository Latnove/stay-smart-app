import { ListingCategoriesRecord } from '@/entities/listing'
import type { UploadFile } from 'antd'
import z from 'zod'

const baseListingFormSchema = z.object({
  title: z.string().min(4, 'Минимальная длина 4 символа').max(80, 'Максимальная длина 80 символов'),
  description: z.string().min(20, 'Минимальная длина 20 символов').max(1000, 'Максимальная длина 1000 символов'),
  city: z.string().min(2, 'Укажите город').max(120, 'Максимальная длина 120 символов'),
  address: z.string().min(4, 'Укажите адрес').max(255, 'Максимальная длина 255 символов'),
  price: z.number().min(1, 'Цена должна быть больше 0'),
  maxGuests: z.number().min(1, 'Минимум 1 гость').max(20, 'Максимум 20 гостей'),
  type: z.enum(Object.keys(ListingCategoriesRecord) as [keyof typeof ListingCategoriesRecord]),
  images: z
    .custom<UploadFile[]>()
    .refine((files) => files.length >= 1, 'Добавьте хотя бы 1 фотографию')
    .refine((files) => files.length <= 10, 'Максимум 10 фотографий'),
})

export const createListingFormSchema = baseListingFormSchema.extend({
  status: z.literal('review').optional(),
})

export const editListingFormSchema = baseListingFormSchema.extend({
  status: z.enum(['review', 'active', 'blocked']),
})

export type CreateListingFormType = z.infer<typeof createListingFormSchema>
export type EditListingFormType = z.infer<typeof editListingFormSchema>
export type ListingFormType = CreateListingFormType | EditListingFormType
