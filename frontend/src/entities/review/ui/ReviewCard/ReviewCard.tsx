import { UserOutlined } from '@ant-design/icons'
import Rate from 'antd/es/rate'
import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'

import type { Review } from '../../model/types'

import { Tag } from 'antd'
import styles from './ReviewCard.module.css'

interface IReviewCard {
  review: Review
  className?: string
  isOwn?: boolean
  badgeText?: string
  children?: ReactNode
}

export const ReviewCard: FC<IReviewCard> = ({ review, className, isOwn, badgeText, children }) => {
  return (
    <article
      className={clsx(
        styles.card,
        {
          [styles.ownCard]: isOwn,
        },
        className,
      )}
    >
      {isOwn && <Tag className={styles.badge}>{badgeText ?? 'Ваш отзыв'}</Tag>}

      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.avatar}>
            <UserOutlined />
          </div>

          <div className={styles.authorInfo}>
            <div className={styles.authorRow}>
              <Text className={styles.author}>{review.author.username}</Text>
            </div>

            <Text className={styles.date}>{review.createdAt}</Text>
          </div>
        </div>

        <div className={styles.right}>
          <Rate disabled value={review.rating} className={styles.rate} />
        </div>
      </div>

      <Text className={styles.text}>{review.text}</Text>

      {isOwn && <div className={styles.ownChildren}>{children}</div>}
    </article>
  )
}
