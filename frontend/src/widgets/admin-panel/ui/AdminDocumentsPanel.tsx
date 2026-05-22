import type { AdminUser } from '@/entities/user'
import { RejectUserVerificationButton } from '@/features/reject-user-verification'
import { VerifyUserButton } from '@/features/verify-user'
import { Tag } from '@/shared/ui/Tag/Tag'
import { ClockCircleOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import Image from 'antd/es/image'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { verificationText } from '../model/constants'
import styles from './AdminPanel.module.css'

interface AdminDocumentsPanelProps {
  users: AdminUser[]
  onRejectUserVerification: (userId: string, reason: string) => void
  onVerifyUser: (userId: string) => void
}

const formatDateTime = (date: string) => format(parseISO(date), 'dd MMM yyyy, HH:mm', { locale: ru })

export const AdminDocumentsPanel = ({ onRejectUserVerification, onVerifyUser, users }: AdminDocumentsPanelProps) => {
  return (
    <div className={styles.list}>
      {users.length === 0 && (
        <div className={styles.empty}>
          <Text>Нет пользователей с документами на проверке</Text>
        </div>
      )}

      {users.map((user) => (
        <article className={styles.card} key={user.id}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.tags}>
                <Tag className={styles.pendingTag}>{verificationText[user.verified]}</Tag>
                <Tag>{user.role}</Tag>
              </div>
              <Title className={styles.cardTitle} level={3}>
                @{user.username}
              </Title>
              <Text className={styles.cardSubtitle}>{user.email}</Text>
            </div>

            <div className={styles.actions}>
              <VerifyUserButton userId={user.id} onVerify={onVerifyUser} />
              <RejectUserVerificationButton userId={user.id} onReject={onRejectUserVerification} />
            </div>
          </div>

          <div className={styles.meta}>
            <span>
              <UserOutlined />
              ID: {user.id}
            </span>
            <span>
              <MailOutlined />
              {user.email}
            </span>
            <span>
              <ClockCircleOutlined />
              Создан: {formatDateTime(user.createdAt)}
            </span>
          </div>

          <div className={styles.docs}>
            {user.documents.map((document, index) => (
              <div className={styles.document} key={document}>
                <Image
                  className={styles.documentImage}
                  src={document}
                  alt={`Документ ${index + 1}`}
                  width='100%'
                  height='100%'
                  preview={{ mask: 'Открыть документ' }}
                />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
