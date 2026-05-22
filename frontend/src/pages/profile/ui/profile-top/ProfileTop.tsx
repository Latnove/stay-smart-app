import { type User, type VerifiedType } from '@/entities/user'
import PeopleSvg from '@/shared/assets/person-svgrepo-com.svg?react'
import { Stat } from '@/shared/ui/Stat/Stat'
import { Tag } from '@/shared/ui/Tag/Tag'
import { CalendarOutlined, HeartOutlined, HomeOutlined, MessageOutlined } from '@ant-design/icons'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './ProfileTop.module.css'

export type ProfileStats = {
  bookings: number
  listings: number
  favorites: number
  reviews: number
}

interface IProfileTop {
  user: User
  stats: ProfileStats
}

const verificationRecord: Record<VerifiedType, { className: string; text: string }> = {
  none: {
    className: styles.error,
    text: 'Профиль не подтвержден',
  },
  pending: {
    className: styles.pending,
    text: 'Документы на проверке',
  },
  verified: {
    className: styles.success,
    text: 'Профиль подтвержден',
  },
  rejected: {
    className: styles.error,
    text: 'Верификация отклонена',
  },
}

export const ProfileTop: FC<IProfileTop> = ({ user, stats }) => {
  const profileStats = [
    { icon: CalendarOutlined, label: 'Бронирования', value: stats.bookings },
    { icon: HomeOutlined, label: 'Объявления', value: stats.listings },
    { icon: HeartOutlined, label: 'Избранное', value: stats.favorites },
    { icon: MessageOutlined, label: 'Мои отзывы', value: stats.reviews },
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.avatar}>
          <PeopleSvg className={styles.svg} />
        </div>
        <div className={styles.content}>
          <Title level={2} className={styles.username}>
            @{user.username}
          </Title>

          <Text className={styles.text}>Управление аккаунтом</Text>

          <Tag className={clsx(styles.tag, verificationRecord[user.verified].className)}>
            {verificationRecord[user.verified].text}
          </Tag>
        </div>
      </div>
      <div className={styles.list}>
        {profileStats.map((el) => (
          <Stat key={el.label} Icon={el.icon} title={el.label} value={el.value} className={styles.statItem} />
        ))}
      </div>
    </div>
  )
}
