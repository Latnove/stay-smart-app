import { declension } from '@/shared/lib'
import { HomeOutlined, IdcardOutlined, TeamOutlined } from '@ant-design/icons'
import Text from 'antd/es/typography/Text'
import styles from './AdminPanel.module.css'

interface AdminDashboardStatsProps {
  pendingUsersCount: number
  pendingListingsCount: number
  usersCount: number
}

export const AdminDashboardStats = ({
  pendingListingsCount,
  pendingUsersCount,
  usersCount,
}: AdminDashboardStatsProps) => {
  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <IdcardOutlined className={styles.svg} />
        <div className={styles.statBody}>
          <span className={styles.statValue}>{pendingUsersCount}</span>
          <Text className={styles.statText}>
            {declension(pendingUsersCount, 'Документ', 'Документа', 'Документов')} на проверке
          </Text>
          <Text className={styles.statCaption}>Новые заявки с прикрепленными фото</Text>
        </div>
      </div>
      <div className={styles.stat}>
        <HomeOutlined className={styles.svg} />
        <div className={styles.statBody}>
          <span className={styles.statValue}>{pendingListingsCount}</span>
          <Text className={styles.statText}>
            {declension(pendingListingsCount, 'Объявление', 'Объявления', 'Объявлений')} на модерации
          </Text>
          <Text className={styles.statCaption}>Публикуются только после решения</Text>
        </div>
      </div>
      <div className={styles.stat}>
        <TeamOutlined className={styles.svg} />
        <div className={styles.statBody}>
          <span className={styles.statValue}>{usersCount}</span>
          <Text className={styles.statText}>Пользователей всего</Text>
          <Text className={styles.statCaption}>Аккаунтов в системе</Text>
        </div>
      </div>
    </div>
  )
}
