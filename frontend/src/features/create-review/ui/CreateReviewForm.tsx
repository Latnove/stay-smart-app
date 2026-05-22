import type { Review } from '@/entities/review'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { ErrorText } from '@/shared/ui/Error/ErrorText'
import { TextareaField } from '@/shared/ui/TextareaField/TextareaField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Rate } from 'antd'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import { Controller, useForm } from 'react-hook-form'
import { createReviewSchema, type CreateReviewFormType } from '../lib/validation'
import styles from './CreateReviewForm.module.css'

interface CreateReviewFormProps {
  review?: Review
  isSubmitting?: boolean
  onSubmit: (values: CreateReviewFormType) => void
  onCancel?: () => void
}

export const CreateReviewForm = ({ review, isSubmitting, onSubmit, onCancel }: CreateReviewFormProps) => {
  const isEdit = Boolean(review)

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<CreateReviewFormType>({
    mode: 'onChange',
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: review?.rating ?? 0,
      text: review?.text ?? '',
    },
    values: {
      rating: review?.rating ?? 0,
      text: review?.text ?? '',
    },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.header}>
        <div>
          <Title className={styles.title} level={3}>
            {isEdit ? 'Изменить отзыв' : 'Оставить отзыв'}
          </Title>

          <Text className={styles.subtitle}>
            {isEdit ? 'Обновите оценку или текст вашего отзыва.' : 'Поделитесь впечатлениями после проживания.'}
          </Text>
        </div>
      </div>

      <label className={styles.label}>
        <Text className={styles.text}>Оценка:</Text>

        <Controller
          control={control}
          name='rating'
          render={({ field, fieldState: { error } }) => (
            <>
              {error && <ErrorText error={error} />}
              <Rate value={field.value} onChange={field.onChange} className={styles.rate} />
            </>
          )}
        />
      </label>

      <label className={styles.label}>
        <Text className={styles.text}>Текст отзыва:</Text>

        <TextareaField
          control={control}
          name='text'
          autoSize={{ minRows: 3, maxRows: 6 }}
          placeholder='Расскажите, что понравилось или что можно улучшить...'
          isSuccessVisible
        />
      </label>

      <div className={styles.actions}>
        {isEdit && (
          <ButtonField type='default' isSecondary onClick={onCancel}>
            Отмена
          </ButtonField>
        )}

        <ButtonField
          htmlType='submit'
          type='primary'
          isPrimary
          disabled={!isValid || isSubmitting || (isEdit && !isDirty)}
          loading={isSubmitting}
        >
          {isEdit ? 'Сохранить отзыв' : 'Отправить отзыв'}
        </ButtonField>
      </div>
    </form>
  )
}
