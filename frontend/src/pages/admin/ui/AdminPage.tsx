import type { Listing } from '@/entities/listing'
import type { AdminUser } from '@/entities/user'
import {
  approveListing,
  blockUser,
  getAdminUsers,
  getReviewListings,
  rejectListing,
  rejectUserVerification,
  unblockUser,
  verifyUser,
} from '@/shared/api'
import { mapAdminUser, mapListing, unwrapApi } from '@/shared/lib'
import { AdminDashboardStats, AdminModerationTabs } from '@/widgets/admin-panel'
import { HeroSection } from '@/widgets/hero-section'
import message from 'antd/es/message'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import styles from './AdminPage.module.css'

export const AdminPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [listings, setListings] = useState<Listing[]>([])

  const pendingUsers = users.filter((user) => user.verified === 'pending')
  const pendingListings = listings.filter((listing) => listing.status === 'review')

  useEffect(() => {
    let ignore = false

    const loadAdminData = async () => {
      try {
        const [usersResponse, listingsResponse] = await Promise.all([
          unwrapApi(
            getAdminUsers({
              query: {
                search: '',
                verificationFilter: 'all',
                sortOrder: 'newest',
              },
            }),
          ),
          unwrapApi(getReviewListings()),
        ])

        if (ignore) return

        setUsers(usersResponse.map(mapAdminUser))
        setListings(listingsResponse.map(mapListing))
      } catch (error) {
        if (!ignore) {
          message.error(error instanceof Error ? error.message : 'Не удалось загрузить админку')
        }
      }
    }

    loadAdminData()

    return () => {
      ignore = true
    }
  }, [])

  const handleVerifyUser = async (userId: string) => {
    const user = await unwrapApi(
      verifyUser({
        path: { id: userId },
      }),
    )

    setUsers((prevUsers) => prevUsers.map((item) => (item.id === userId ? mapAdminUser(user) : item)))
  }

  const handleRejectUserVerification = async (userId: string, reason: string) => {
    const user = await unwrapApi(
      rejectUserVerification({
        path: { id: userId },
        body: { reason },
      }),
    )

    setUsers((prevUsers) => prevUsers.map((item) => (item.id === userId ? mapAdminUser(user) : item)))
  }

  const handleBlockUser = async (userId: string, reason: string) => {
    const user = await unwrapApi(
      blockUser({
        path: { id: userId },
        body: { reason },
      }),
    )

    setUsers((prevUsers) => prevUsers.map((item) => (item.id === userId ? mapAdminUser(user) : item)))
  }

  const handleUnblockUser = async (userId: string) => {
    const user = await unwrapApi(
      unblockUser({
        path: { id: userId },
      }),
    )

    setUsers((prevUsers) => prevUsers.map((item) => (item.id === userId ? mapAdminUser(user) : item)))
  }

  const handleApproveListing = async (listingId: string) => {
    await unwrapApi(
      approveListing({
        path: { id: listingId },
      }),
    )

    setListings((prevListings) => prevListings.filter((listing) => listing.id !== listingId))
  }

  const handleRejectListing = async (listingId: string, reason: string) => {
    await unwrapApi(
      rejectListing({
        path: { id: listingId },
        body: { reason },
      }),
    )

    setListings((prevListings) => prevListings.filter((listing) => listing.id !== listingId))
  }

  return (
    <main className={styles.page}>
      <HeroSection
        tag='Админка'
        title='Панель администратора'
        text='Проверяйте документы пользователей, управляйте статусами объявлений и быстро находите нужные аккаунты.'
      />

      <section className={styles.section}>
        <div className={clsx('container', styles.container)}>
          <AdminDashboardStats
            pendingUsersCount={pendingUsers.length}
            pendingListingsCount={pendingListings.length}
            usersCount={users.length}
          />

          <AdminModerationTabs
            users={users}
            pendingUsers={pendingUsers}
            pendingListings={pendingListings}
            onVerifyUser={handleVerifyUser}
            onRejectUserVerification={handleRejectUserVerification}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
          />
        </div>
      </section>
    </main>
  )
}
