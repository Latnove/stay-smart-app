import type { AdminUser } from '@/entities/user'
import { AdminUserFilters, selectAdminUserFilters, useAdminUserFiltersStore } from '@/features/admin-user-filters'
import { BlockUserButton, UnblockUserButton } from '@/features/block-user'
import { Tag } from '@/shared/ui/Tag/Tag'
import { UserOutlined } from '@ant-design/icons'
import Text from 'antd/es/typography/Text'
import clsx from 'clsx'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { verificationText } from '../model/constants'
import styles from './AdminPanel.module.css'

interface AdminUsersPanelProps {
  users: AdminUser[]
  onBlockUser: (userId: string, reason: string) => void
  onUnblockUser: (userId: string) => void
}

const formatDateTime = (date: string) => format(parseISO(date), 'dd MMM yyyy, HH:mm', { locale: ru })

export const AdminUsersPanel = ({ onBlockUser, onUnblockUser, users }: AdminUsersPanelProps) => {
  const { search, sortOrder, verificationFilter } = useAdminUserFiltersStore(useShallow(selectAdminUserFilters))

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return users
      .filter((user) => {
        const matchesSearch =
          !normalizedSearch ||
          user.email.toLowerCase().includes(normalizedSearch) ||
          user.username.toLowerCase().includes(normalizedSearch)
        const matchesVerification =
          verificationFilter === 'all' ||
          (verificationFilter === 'blocked' ? Boolean(user.blocked) : user.verified === verificationFilter)

        return matchesSearch && matchesVerification
      })
      .sort((firstUser, secondUser) => {
        const firstDate = parseISO(firstUser.createdAt).getTime()
        const secondDate = parseISO(secondUser.createdAt).getTime()

        return sortOrder === 'newest' ? secondDate - firstDate : firstDate - secondDate
      })
  }, [search, sortOrder, users, verificationFilter])

  return (
    <div className={styles.panel}>
      <AdminUserFilters />

      <div className={styles.usersList}>
        {filteredUsers.map((user) => (
          <article className={styles.userRow} key={user.id}>
            <div className={styles.userIcon}>
              <UserOutlined />
            </div>

            <div className={styles.userInfo}>
              <Text className={styles.userName}>@{user.username}</Text>
              <Text className={styles.userMeta}>
                {user.email} · ID: {user.id}
              </Text>
              {(user.verificationReason || user.blockReason) && (
                <Text className={styles.userReason}>Причина: {user.blockReason ?? user.verificationReason}</Text>
              )}
            </div>

            <div className={styles.userTags}>
              <Tag
                className={clsx(
                  user.verified === 'verified' && styles.verifiedTag,
                  user.verified === 'pending' && styles.pendingTag,
                  user.verified === 'none' && styles.neutralTag,
                  user.verified === 'rejected' && styles.rejectedTag,
                )}
              >
                {verificationText[user.verified]}
              </Tag>

              {user.blocked && <Tag className={styles.dangerTag}>Заблокирован</Tag>}

              <Text className={styles.createdAt}>{formatDateTime(user.createdAt)}</Text>

              {user.blocked ? (
                <UnblockUserButton userId={user.id} onUnblock={onUnblockUser} className={styles.tagsButton} />
              ) : (
                <BlockUserButton
                  userId={user.id}
                  onBlock={onBlockUser}
                  disabled={user.role === 'admin'}
                  className={styles.tagsButton}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
