import { ListingCategoriesRecord, type Listing } from '@/entities/listing'
import type { Review } from '@/entities/review'
import { selectUser, useUserStore } from '@/entities/user'
import { BookListingButton } from '@/features/booking'
import { EditListingButton } from '@/features/edit-button'
import { FavoriteButton } from '@/features/favorites'
import { OwnerListingRentals } from '@/features/listing-rentals'
import { NotFoundPage } from '@/pages/not-found'
import { getListingById, getListingReviews } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { declension, isUUID, mapListing, mapReview, unwrapApi } from '@/shared/lib'
import { StarWithFill } from '@/shared/ui/StarWithFill/StarWithFill'
import { Tag } from '@/shared/ui/Tag/Tag'
import { ListingReviews } from '@/widgets/listing-reviews'
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  IdcardOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Image from 'antd/es/image'
import Text from 'antd/es/typography/Text'
import Title from 'antd/es/typography/Title'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import styles from './ListingDetailsPage.module.css'

const MAX_IMAGES_COUNT = 10
const VISIBLE_THUMBS_COUNT = 5

const statusText = {
  review: 'На проверке',
  active: 'Активное',
  blocked: 'Заблокировано',
} as const

type ListingDetailsState = {
  requestKey: string
  listing: Listing | null
  reviews: Review[]
  myReview?: Review
  error: string
}

export const ListingDetailsPage = () => {
  const { listingId } = useParams()
  const { user } = useUserStore(useShallow(selectUser))
  const requestKey = `${listingId ?? ''}:${user?.id ?? ''}`
  const hasValidListingId = Boolean(listingId && isUUID(listingId))
  const [state, setState] = useState<ListingDetailsState>({
    requestKey: '',
    listing: null,
    reviews: [],
    error: '',
  })

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [listingId])

  useEffect(() => {
    if (!listingId) return

    let ignore = false

    if (!isUUID(listingId)) return

    const loadListing = async () => {
      try {
        const [listingDto, reviewDtos] = await Promise.all([
          unwrapApi(
            getListingById({
              path: { id: listingId },
            }),
          ),
          unwrapApi(
            getListingReviews({
              path: { listingId },
            }),
          ),
        ])

        if (ignore) return

        const nextReviews = reviewDtos.map(mapReview)

        setState({
          requestKey,
          listing: mapListing(listingDto),
          myReview: nextReviews.find((review) => review.author.id === user?.id),
          reviews: nextReviews.filter((review) => review.author.id !== user?.id),
          error: '',
        })
      } catch (requestError) {
        if (!ignore) {
          setState({
            requestKey,
            listing: null,
            reviews: [],
            error: requestError instanceof Error ? requestError.message : 'Не удалось загрузить объявление',
          })
        }
      }
    }

    loadListing()

    return () => {
      ignore = true
    }
  }, [listingId, requestKey, user?.id])

  const loading = hasValidListingId && state.requestKey !== requestKey
  const error = !listingId ? '' : !hasValidListingId ? 'Некорректный ID объявления' : loading ? '' : state.error
  const listing = loading ? null : state.listing
  const reviews = loading ? [] : state.reviews
  const myReview = loading ? undefined : state.myReview

  const handleCreateReview = (review: Review) => {
    setState((prev) => ({
      ...prev,
      myReview: review,
      reviews: [review, ...prev.reviews],
    }))
  }

  const handleUpdateReview = (updatedReview: Review) => {
    if (updatedReview.author.id === user?.id) {
      setState((prev) => ({ ...prev, myReview: updatedReview }))
      return
    }

    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((review) => (review.id === updatedReview.id ? updatedReview : review)),
    }))
  }

  if (loading) {
    return <Text>Загрузка объявления...</Text>
  }

  if (error) {
    return <NotFoundPage title='Объявление не найдено' subtitle={error} />
  }

  if (!listing) {
    return (
      <NotFoundPage title='Объявление не найдено' subtitle='Возможно, оно было удалено или ссылка указана неверно.' />
    )
  }

  const images = listing.images.slice(0, MAX_IMAGES_COUNT)
  const visibleThumbs = images.slice(1, VISIBLE_THUMBS_COUNT + 1)
  const hiddenImagesCount = Math.max(images.length - (VISIBLE_THUMBS_COUNT + 1), 0)
  const ownerUsername = listing.ownerUsername || (listing.isOwner && user ? user.username : 'unknown')
  const isAdmin = user?.role === 'admin'
  const isBlockedListing = listing.status === 'blocked'
  const canViewListing = !isBlockedListing || listing.isOwner || isAdmin
  const canManageListing = isAdmin || (listing.isOwner && !isBlockedListing)

  if (!canViewListing) {
    return <Navigate to={ROUTES.FORBIDDEN.path} replace />
  }

  return (
    <section className={styles.section}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <div className={styles.gallery}>
              {images.length > 0 ? (
                <Image.PreviewGroup items={images}>
                  <Image
                    className={styles.mainImage}
                    src={images[0]}
                    alt={listing.title}
                    width='100%'
                    height='100%'
                    preview={{ mask: 'Смотреть фото' }}
                  />

                  {images.length > 1 && (
                    <div className={styles.thumbs}>
                      {visibleThumbs.map((image, index) => {
                        const isLastVisibleThumb = index === visibleThumbs.length - 1
                        const maskText =
                          isLastVisibleThumb && hiddenImagesCount > 0 ? `+${hiddenImagesCount}` : 'Открыть'

                        return (
                          <Image
                            key={image}
                            className={styles.thumbImage}
                            src={image}
                            alt={`${listing.title}, фото ${index + 2}`}
                            width='100%'
                            height='100%'
                            preview={{ mask: maskText }}
                          />
                        )
                      })}
                    </div>
                  )}
                </Image.PreviewGroup>
              ) : (
                <div className={styles.imageFallback}>Фото пока не добавлены</div>
              )}
            </div>

            <article className={styles.descriptionBlock}>
              <Title className={styles.blockTitle} level={2}>
                О недвижимости
              </Title>
              <Text className={styles.description}>{listing.description}</Text>
            </article>
          </div>

          <aside className={styles.summary}>
            {listing.status === 'active' && <FavoriteButton listing={listing} className={styles.favorite} />}

            <div className={styles.tags}>
              <Tag>{ListingCategoriesRecord[listing.type].text}</Tag>
              <Tag className={styles.city}>{listing.city}</Tag>
              <Tag className={styles.ratingTag}>
                {listing.rating.toFixed(2)}
                <StarWithFill fillPercent={listing.rating / 5} size={14} />
              </Tag>
            </div>

            <Title className={styles.title} level={1}>
              {listing.title}
            </Title>

            <Text className={styles.address}>
              <EnvironmentOutlined />
              {listing.address}
            </Text>

            <div className={styles.priceRow}>
              <Text className={styles.price}>{listing.price} руб.</Text>
              <Text className={styles.priceCaption}>за ночь</Text>
            </div>

            <div className={styles.properties}>
              <div className={styles.property}>
                <IdcardOutlined className={clsx(styles.propertyIcon, styles.idIcon)} />
                <div>
                  <Text className={styles.propertyValue}>
                    <span>ID объявления:</span> {listing.id}
                  </Text>
                </div>
              </div>

              <div className={styles.property}>
                <HomeOutlined className={clsx(styles.propertyIcon, styles.homeIcon)} />
                <div>
                  <Text className={styles.propertyValue}>
                    <span>Тип недвижимости:</span> {ListingCategoriesRecord[listing.type].text}
                  </Text>
                </div>
              </div>

              <div className={styles.property}>
                <TeamOutlined className={clsx(styles.propertyIcon, styles.guestsIcon)} />
                <div>
                  <Text className={styles.propertyValue}>
                    <span>Гостей:</span> {listing.maxGuests} {declension(listing.maxGuests, 'гость', 'гостя', 'гостей')}
                  </Text>
                </div>
              </div>

              <div className={styles.property}>
                <UserOutlined className={clsx(styles.propertyIcon, styles.ownerIcon)} />
                <div>
                  <Text className={styles.propertyValue}>
                    <span>Владелец:</span> @{ownerUsername}
                  </Text>
                </div>
              </div>

              <div className={styles.property}>
                <StarFilled className={clsx(styles.propertyIcon, styles.ratingIcon)} />
                <div>
                  <Text className={styles.propertyValue}>
                    <span>Рейтинг:</span> {listing.rating.toFixed(1)} из 5
                  </Text>
                </div>
              </div>

              <div className={styles.property}>
                <CheckCircleOutlined className={clsx(styles.propertyIcon, styles.statusIcon)} />
                <div>
                  <Text className={styles.propertyValue}>
                    <span>Статус:</span> {statusText[listing.status]}
                  </Text>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              {listing.status === 'active' && <BookListingButton listing={listing} />}

              {canManageListing && <EditListingButton size='large' listingId={listing.id} block />}
            </div>
          </aside>
        </div>

        {canManageListing && <OwnerListingRentals listingId={listing.id} currentUser={user} />}

        <ListingReviews
          reviews={reviews}
          listingId={listing.id}
          onCreate={handleCreateReview}
          onUpdate={handleUpdateReview}
          myReview={myReview}
          canEditAll={user?.role === 'admin'}
        />
      </div>
    </section>
  )
}
