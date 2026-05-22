import { actionFavorites, useFavoritesStore } from '@/entities/favorite'
import { actionUser, selectUser, useUserStore } from '@/entities/user'
import { getMyStats, logout } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { unwrapApi } from '@/shared/lib'
import { Button } from 'antd'
import message from 'antd/es/message'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './ProfilePage.module.css'
import { ProfileContent } from './profile-content/ProfileContent'
import { ProfileTop, type ProfileStats } from './profile-top/ProfileTop'

const emptyStats: ProfileStats = {
  bookings: 0,
  listings: 0,
  favorites: 0,
  reviews: 0,
}

export const ProfilePage = () => {
  const { user } = useUserStore(useShallow(selectUser))
  const { clearUser } = useUserStore(useShallow(actionUser))
  const { resetLocalFavorites } = useFavoritesStore(useShallow(actionFavorites))
  const [stats, setStats] = useState<ProfileStats>(emptyStats)

  useEffect(() => {
    if (!user) return

    let ignore = false

    const loadStats = async () => {
      try {
        const response = await unwrapApi(getMyStats())

        if (ignore) return

        setStats({
          bookings: response.bookings ?? 0,
          listings: response.listings ?? 0,
          favorites: response.favorites ?? 0,
          reviews: response.reviews ?? 0,
        })
      } catch {
        if (!ignore) setStats(emptyStats)
      }
    }

    loadStats()

    return () => {
      ignore = true
    }
  }, [user])

  if (!user) return <Navigate to={ROUTES.HOME.path} />

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearUser()
      resetLocalFavorites()
      message.success('Вы вышли из аккаунта')
    }
  }

  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <Title level={1} className={styles.title}>
          Личный кабинет
        </Title>

        <ProfileTop user={user} stats={stats} />

        <ProfileContent user={user} />

        <Button className={styles.logoutButton} onClick={handleLogout} danger>
          Выйти из аккаунта
        </Button>
      </div>
    </section>
  )
}
