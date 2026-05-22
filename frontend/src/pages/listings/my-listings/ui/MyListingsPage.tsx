import { ListingCard, type Listing, type ListingStatus } from '@/entities/listing'
import { getMyListings } from '@/shared/api'
import { ROUTES } from '@/shared/config/routes'
import { mapListing, unwrapApi } from '@/shared/lib'
import { ButtonField } from '@/shared/ui/ButtonField/ButtonField'
import { Tag } from '@/shared/ui/Tag/Tag'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { selectUser, useUserStore } from '@/entities/user'
import { FavoriteButton } from '@/features/favorites'
import { HeroSection } from '@/widgets/hero-section'
import clsx from 'clsx'
import { useShallow } from 'zustand/shallow'
import styles from './MyListingsPage.module.css'

const listingStatusText: Record<ListingStatus, string> = {
  review: 'На проверке',
  active: 'Активное',
  blocked: 'Заблокировано',
}

export const MyListingsPage = () => {
  const navigate = useNavigate()
  const { user } = useUserStore(useShallow(selectUser))
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await unwrapApi(getMyListings())
        setListings(response.map(mapListing))
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить объявления')
      }
    }

    loadListings()
  }, [])

  return (
    <main className={styles.page}>
      <HeroSection
        tag='Объявления'
        title='Создайте объявление'
        text='Добавьте жильё, описание, цену и фотографии, чтобы пользователи могли найти и забронировать ваш объект.'
      >
        {!(user?.role === 'user' && user.verified !== 'verified') && (
          <ButtonField size='large' type='primary' isPrimary onClick={() => navigate(ROUTES.LISTINGS_CREATE.path)}>
            Создать объявление
          </ButtonField>
        )}
      </HeroSection>

      <section className={styles.listSection}>
        <div className='container'>
          <div className={styles.sectionHeader}>
            <Title className={styles.sectionTitle} level={2}>
              Ваши созданные объявления
            </Title>

            <Text className={styles.sectionSubtitle}>
              Управляйте опубликованными объявлениями и редактируйте информацию при необходимости.
            </Text>
          </div>

          <div className={styles.list}>
            {error && <Text type='danger'>{error}</Text>}
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing}>
                <div className={styles.actions}>
                  <Tag
                    className={clsx(
                      styles.status,
                      listing.status === 'active' && styles.statusActive,
                      listing.status === 'review' && styles.statusReview,
                      listing.status === 'blocked' && styles.statusBlocked,
                    )}
                  >
                    {listingStatusText[listing.status]}
                  </Tag>

                  {listing.status === 'active' && <FavoriteButton listing={listing} className={styles.favorite} />}
                </div>
              </ListingCard>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
