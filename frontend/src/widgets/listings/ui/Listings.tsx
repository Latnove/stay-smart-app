import type { Listing } from '@/entities/listing'
import {
  actionPagination,
  ListingFilters,
  ListingSort,
  selectCardView,
  selectFilters,
  selectPagination,
  selectSort,
  useListingsStore,
} from '@/features/listings-catalog'
import { getListings } from '@/shared/api'
import { mapListing, unwrapApi } from '@/shared/lib'
import { ListingList } from '@/widgets/listing-list'
import Text from 'antd/es/typography/Text'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './Listings.module.css'

type ListingsState = {
  requestKey: string
  listings: Listing[]
  total: number
  error: string
}

export const Listings = () => {
  const { page, limit } = useListingsStore(useShallow(selectPagination))
  const { setPage } = useListingsStore(useShallow(actionPagination))
  const { isShortCard } = useListingsStore(useShallow(selectCardView))
  const filters = useListingsStore(useShallow(selectFilters))
  const { sortBy, order } = useListingsStore(useShallow(selectSort))
  const category = filters.category?.join(',')
  const requestKey = useMemo(
    () =>
      JSON.stringify({
        page,
        limit,
        sortBy,
        order,
        city: filters.city,
        priceFrom: filters.priceFrom,
        priceTo: filters.priceTo,
        minGuests: filters.minGuests,
        ratingFrom: filters.ratingFrom,
        ratingTo: filters.ratingTo,
        category,
      }),
    [
      category,
      filters.city,
      filters.minGuests,
      filters.priceFrom,
      filters.priceTo,
      filters.ratingFrom,
      filters.ratingTo,
      limit,
      order,
      page,
      sortBy,
    ],
  )
  const [state, setState] = useState<ListingsState>({
    requestKey: '',
    listings: [],
    total: 0,
    error: '',
  })

  useEffect(() => {
    let ignore = false

    const loadListings = async () => {
      try {
        const response = await unwrapApi(
          getListings({
            query: {
              page,
              limit,
              sortBy,
              order,
              city: filters.city,
              priceFrom: filters.priceFrom,
              priceTo: filters.priceTo,
              minGuests: filters.minGuests,
              ratingFrom: filters.ratingFrom,
              ratingTo: filters.ratingTo,
              category,
            },
          }),
        )

        if (ignore) return

        setState({
          requestKey,
          listings: response.items?.map(mapListing) ?? [],
          total: response.total ?? 0,
          error: '',
        })
      } catch (requestError) {
        if (ignore) return

        setState({
          requestKey,
          listings: [],
          total: 0,
          error: requestError instanceof Error ? requestError.message : 'Не удалось загрузить объявления',
        })
      }
    }

    loadListings()

    return () => {
      ignore = true
    }
  }, [
    category,
    filters.city,
    filters.minGuests,
    filters.priceFrom,
    filters.priceTo,
    filters.ratingFrom,
    filters.ratingTo,
    limit,
    order,
    page,
    requestKey,
    sortBy,
  ])

  const loading = state.requestKey !== requestKey
  const listings = loading ? [] : state.listings
  const total = loading ? 0 : state.total
  const error = loading ? '' : state.error

  return (
    <div className={styles.catalog}>
      <ListingSort className={styles.sort} total={total} />
      <div className={styles.wrapper}>
        <ListingFilters className={styles.filters} />

        {listings.length !== 0 && (
          <ListingList
            pagination={{ page, limit, setPage }}
            listings={listings}
            isShortCard={isShortCard}
            total={total}
            className={styles.listingList}
          />
        )}

        {loading && <Text>Загрузка объявлений...</Text>}
        {error && <Text type='danger'>{error}</Text>}
        {!loading && !error && listings.length === 0 && (
          <Text className={styles.empty}>Объявлений пока нет. Попробуйте изменить фильтры или зайдите позже.</Text>
        )}
      </div>
    </div>
  )
}
