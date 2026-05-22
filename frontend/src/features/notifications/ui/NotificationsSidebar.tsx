import { selectUser, useUserStore } from '@/entities/user'
import type { NotificationDto } from '@/shared/api'
import { connectNotificationsSocket, mapNotification } from '@/shared/lib'
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, LinkOutlined } from '@ant-design/icons'
import Badge from 'antd/es/badge'
import Button from 'antd/es/button'
import Drawer from 'antd/es/drawer'
import Empty from 'antd/es/empty'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import { actionNotifications, selectNotifications, useNotificationsStore } from '../model/useNotificationsStore'
import styles from './NotificationsSidebar.module.css'

const formatNotificationDate = (date: string) => format(parseISO(date), 'dd MMM yyyy, HH:mm', { locale: ru })

export const NotificationsSidebar = () => {
  const navigate = useNavigate()
  const { accessToken, user } = useUserStore(useShallow(selectUser))
  const { notifications } = useNotificationsStore(useShallow(selectNotifications))
  const { addNotification, loadNotifications, markAllAsRead, markAsRead } = useNotificationsStore(
    useShallow(actionNotifications),
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadUserNotifications = async () => {
      try {
        await loadNotifications()
      } catch {
        return
      }
    }

    loadUserNotifications()
  }, [loadNotifications, user])

  useEffect(() => {
    if (!user || !accessToken) return

    const connection = connectNotificationsSocket(
      accessToken,
      (body) => {
        try {
          const notification = JSON.parse(body) as NotificationDto
          addNotification(mapNotification(notification))
        } catch (error) {
          console.error('Invalid notification message', error)
        }
      },
      () => {
        void loadNotifications()
      },
    )

    return () => {
      connection.close()
    }
  }, [accessToken, addNotification, loadNotifications, user])

  const userNotifications = useMemo(() => {
    if (!user) return []

    return notifications
      .filter((notification) => notification.userId === user.id)
      .sort((firstNotification, secondNotification) => {
        return parseISO(secondNotification.createdAt).getTime() - parseISO(firstNotification.createdAt).getTime()
      })
  }, [notifications, user])

  const unreadCount = userNotifications.filter((notification) => !notification.isRead).length

  const handleOpen = async () => {
    setOpen(true)

    if (user) {
      await markAllAsRead()
    }
  }

  const handleNavigate = async (notificationId: string, link: string) => {
    await markAsRead(notificationId)
    setOpen(false)
    navigate(link)
  }

  if (!user) return null

  return (
    <>
      <button className={styles.opener} type='button' onClick={handleOpen} aria-label='Открыть уведомления'>
        <Badge count={unreadCount} size='small' offset={[2, -2]}>
          <BellOutlined className={styles.openerIcon} />
        </Badge>
      </button>

      <Drawer
        title={null}
        placement='right'
        size={420}
        open={open}
        onClose={() => setOpen(false)}
        className={styles.drawer}
        styles={{
          body: {
            padding: 24,
            backgroundColor: 'var(--color-bg-page)',
          },
        }}
      >
        <div className={styles.header}>
          <div>
            <Title className={styles.title} level={2}>
              Уведомления
            </Title>
            <Text className={styles.subtitle}>
              {userNotifications.length ? `${userNotifications.length} событий в вашем аккаунте` : 'Пока пусто'}
            </Text>
          </div>

          <CheckCircleOutlined className={styles.headerIcon} />
        </div>

        {userNotifications.length === 0 ? (
          <Empty description='Уведомлений пока нет' />
        ) : (
          <div className={styles.list}>
            {userNotifications.map((notification) => (
              <article className={clsx(styles.card, !notification.isRead && styles.unread)} key={notification.id}>
                <div className={styles.cardTop}>
                  <Title className={styles.cardTitle} level={3}>
                    {notification.title}
                  </Title>
                  {!notification.isRead && <span className={styles.dot} />}
                </div>

                <Text className={styles.text}>{notification.text}</Text>

                <div className={styles.footer}>
                  <Text className={styles.date}>
                    <ClockCircleOutlined />
                    {formatNotificationDate(notification.createdAt)}
                  </Text>

                  <Button
                    type='link'
                    className={styles.link}
                    icon={<LinkOutlined />}
                    onClick={() => handleNavigate(notification.id, notification.link)}
                  >
                    Перейти
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Drawer>
    </>
  )
}
