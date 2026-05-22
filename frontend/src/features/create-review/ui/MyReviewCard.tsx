import type { Review } from '@/entities/review'
import { ReviewCard } from '@/entities/review'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { EditOutlined } from '@ant-design/icons'
import styles from './CreateReviewForm.module.css'

interface MyReviewCardProps {
  review: Review
  onEdit: () => void
  badgeText?: string
}

export const MyReviewCard = ({ review, onEdit, badgeText }: MyReviewCardProps) => {
  return (
    <ReviewCard review={review} isOwn badgeText={badgeText}>
      <ButtonField size='small' isSecondary icon={<EditOutlined />} onClick={onEdit} className={styles.editButton}>
        Изменить
      </ButtonField>
    </ReviewCard>
  )
}
