import { type ListingCategory } from '@/entities/listing'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface IListingFilters {
  city?: string
  priceFrom?: number
  priceTo?: number
  minGuests?: number
  ratingFrom?: number
  ratingTo?: number
  category?: readonly ListingCategory[]
}

interface IListingSorts {
  sortBy: 'price' | 'name' | 'rating'
  order: 'asc' | 'desc'
}

interface IListingCatalog extends IListingFilters, IListingSorts {
  isShortCard: boolean
  page: number
  limit: number

  resetFilters: () => void
  setPage: (page: number) => void
  setFilters: (filters: IListingFilters) => void
  setSortBy: (sorts: IListingSorts) => void
  setIsShortCard: (isShort: boolean) => void
}

const initialState = {
  page: 1,
  limit: 9,
  sortBy: 'name',
  order: 'asc',
  city: undefined,
  priceFrom: undefined,
  priceTo: undefined,
  minGuests: undefined,
  ratingFrom: undefined,
  ratingTo: undefined,
  category: undefined,
} as const

export const useListingsStore = create<IListingCatalog>()(
  devtools(
    (set) => ({
      ...initialState,
      isShortCard: true,

      setFilters: (filters) =>
        set(
          (state) => ({
            ...state,
            ...filters,
            page: 1,
          }),
          false,
          'setFilters',
        ),

      setPage: (page) =>
        set(
          (state) => ({
            ...state,
            page,
          }),
          false,
          'setPage',
        ),

      setSortBy: (sorts) =>
        set(
          (state) => ({
            ...state,
            sortBy: sorts.sortBy,
            order: sorts.order,
          }),
          false,
          'setSortBy',
        ),

      resetFilters: () =>
        set(
          () => ({
            ...initialState,
          }),
          false,
          'resetFilters',
        ),

      setIsShortCard: (isShortCard) => set({ isShortCard }, false, 'setIsShortCard'),
    }),
    { name: 'listings-store' },
  ),
)

export const selectCardView = (state: IListingCatalog) => ({
  isShortCard: state.isShortCard,
})

export const actionCardView = (state: IListingCatalog) => ({
  setIsShortCard: state.setIsShortCard,
})

export const selectPagination = (state: IListingCatalog) => ({
  page: state.page,
  limit: state.limit,
})

export const actionPagination = (state: IListingCatalog) => ({
  setPage: state.setPage,
})

export const selectSort = (state: IListingCatalog) => ({
  sortBy: state.sortBy,
  order: state.order,
})

export const actionSort = (state: IListingCatalog) => ({
  setSortBy: state.setSortBy,
})

export const selectFilters = (state: IListingCatalog) => ({
  category: state.category,
  city: state.city,
  minGuests: state.minGuests,
  priceFrom: state.priceFrom,
  priceTo: state.priceTo,
  ratingFrom: state.ratingFrom,
  ratingTo: state.ratingTo,
})

export const actionFilters = (state: IListingCatalog) => ({
  setFilters: state.setFilters,
  resetFilters: state.resetFilters,
})
