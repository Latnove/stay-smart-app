import { selectFavorites, useFavoritesStore } from '@/entities/favorite'
import { ListingCard, type Listing } from '@/entities/listing'
import { selectUser, useUserStore } from '@/entities/user'
import { FavoriteButton } from '@/features/favorites'
import { getListingsByIds, getMyFavoriteListings } from '@/shared/api'
import { mapListing, unwrapApi } from '@/shared/lib'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './FavoritesPage.module.css'

export const FavoritesPage = () => {
  const { user } = useUserStore(useShallow(selectUser))
  const { favorites } = useFavoritesStore(useShallow(selectFavorites))
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      try {
        setError('')

        if (user) {
          const listings = await unwrapApi(getMyFavoriteListings())

          if (isMounted) {
            setFavoriteListings(listings.map(mapListing))
          }

          return
        }

        if (!favorites.length) {
          setFavoriteListings([])
          return
        }

        const listings = await unwrapApi(
          getListingsByIds({
            body: favorites,
          }),
        )

        if (isMounted) {
          setFavoriteListings(listings.map(mapListing))
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить избранное')
        }
      }
    }

    void loadFavorites()

    return () => {
      isMounted = false
    }
  }, [user, favorites])

  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <Title className={styles.title} level={1}>
          Избранные объявления ({favoriteListings.length} шт.)
        </Title>
        <div className={styles.list}>
          {favoriteListings.length === 0 && (
            <Text type='danger'>{error || 'У вас пока нету избранных, сначала вам необходимо их добавить'}</Text>
          )}
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing}>
              <FavoriteButton listing={listing} />
            </ListingCard>
          ))}
        </div>
      </div>
    </section>
  )
}
