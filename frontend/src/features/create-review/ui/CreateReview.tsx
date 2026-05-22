import type { Review } from '@/entities/review'
import { selectUser, useUserStore, type User } from '@/entities/user'
import { notification } from 'antd'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { createReview } from '../api/createReview'
import { updateReview } from '../api/updateReview'
import type { CreateReviewFormType } from '../lib/validation'
import { CreateReviewForm } from './CreateReviewForm'
import { MyReviewCard } from './MyReviewCard'

interface CreateReviewProps {
  listingId: string
  review?: Review
  onCreate: (review: Review) => void
  onUpdate?: (review: Review) => void
  badgeText?: string
}

export const CreateReview = ({ listingId, review, onCreate, onUpdate, badgeText }: CreateReviewProps) => {
  const { user } = useUserStore(useShallow(selectUser))

  const [isEditing, setIsEditing] = useState(!review)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = Boolean(review)

  const handleError = (error: unknown) => {
    const status = typeof error === 'object' && error && 'status' in error ? error.status : null

    if (status === 401) {
      notification.error({
        message: 'Необходимо авторизоваться',
        description: 'Войдите в аккаунт, чтобы оставить отзыв.',
      })

      return
    }

    if (status === 403) {
      notification.error({
        message: 'Недостаточно прав',
        description: isEdit ? 'Вы не можете изменить этот отзыв.' : 'Вы не можете оставить отзыв для этого объявления.',
      })

      return
    }

    notification.error({
      message: 'Ошибка',
      description: 'Не удалось сохранить отзыв. Попробуйте позже.',
    })
  }

  const handleSubmit = async (values: CreateReviewFormType) => {
    try {
      setIsSubmitting(true)

      if (review) {
        const updatedReview = await updateReview({
          listingId,
          review,
          ...values,
        })

        onUpdate?.(updatedReview)
        setIsEditing(false)

        notification.success({
          message: 'Отзыв изменён',
          description: 'Ваш отзыв успешно обновлён.',
        })

        return
      }

      const createdReview = await createReview(
        {
          listingId,
          ...values,
        },
        user as User,
      )

      onCreate(createdReview)

      notification.success({
        message: 'Отзыв добавлен',
        description: 'Ваш отзыв успешно опубликован.',
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (review && !isEditing) {
    return <MyReviewCard review={review} badgeText={badgeText} onEdit={() => setIsEditing(true)} />
  }

  return (
    <CreateReviewForm
      review={review}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={() => setIsEditing(false)}
    />
  )
}
