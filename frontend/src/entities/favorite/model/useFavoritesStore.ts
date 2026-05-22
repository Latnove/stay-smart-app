import type { Listing } from '@/entities/listing'
import { useUserStore } from '@/entities/user'
import {
  addFavorite as apiAddFavorite,
  getMyFavorites,
  mergeFavorites as apiMergeFavorites,
  removeFavorite as apiRemoveFavorite,
} from '@/shared/api'
import { filterUUIDs, isUUID, unwrapApi } from '@/shared/lib'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import type { Favorite } from './types'

interface IFavoritesState {
  favorites: Favorite[]
  source: 'local' | 'server'
  offset: number
  limit: number
}

interface IFavoritesActions {
  toggleFavorite: (listing: Listing) => Promise<void>
  loadFavorites: () => Promise<void>
  syncFavoritesAfterLogin: () => Promise<void>
  setFavorites: (favorites: Favorite[]) => void
  mergeFavorites: (favorites: Favorite[], source?: 'local' | 'server') => void
  resetLocalFavorites: () => void
  setOffset: (offset: number) => void
  setSource: (source: 'local' | 'server') => void
}

const initialState: IFavoritesState = {
  favorites: [],
  source: 'local',
  offset: 10,
  limit: 10,
}

export const useFavoritesStore = create<IFavoritesState & IFavoritesActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        toggleFavorite: async (listing) => {
          const user = useUserStore.getState().user

          if (!listing) return

          if (!isUUID(listing.id)) {
            console.error('Invalid UUID', listing.id)
            return
          }

          const exists = get().favorites.includes(listing.id)

          if (exists) {
            if (user) {
              const favorites = await unwrapApi(
                apiRemoveFavorite({
                  path: { listingId: listing.id },
                }),
              )

              set({ favorites, source: 'server' }, false, 'toggleFavorite')
              return
            }

            set(
              (state) => ({
                favorites: state.favorites.filter((id) => id !== listing.id),
                source: 'local',
              }),
              false,
              'toggleFavorite',
            )
          } else {
            if (user) {
              const favorites = await unwrapApi(
                apiAddFavorite({
                  body: { listingId: listing.id },
                }),
              )

              set({ favorites, source: 'server' }, false, 'toggleFavorite')
              return
            }

            const newFavorite: Favorite = listing.id

            set(
              (state) => ({
                favorites: Array.from(new Set([...state.favorites, newFavorite])),
                source: 'local',
              }),
              false,
              'toggleFavorite',
            )
          }
        },

        loadFavorites: async () => {
          if (!useUserStore.getState().user) return

          const favorites = await unwrapApi(getMyFavorites())
          set({ favorites: filterUUIDs(favorites), source: 'server' }, false, 'loadFavorites')
        },

        syncFavoritesAfterLogin: async () => {
          const localFavorites = filterUUIDs(get().favorites)

          const favorites = await unwrapApi(
            apiMergeFavorites({
              body: {
                listingIds: localFavorites,
              },
            }),
          )

          set({ favorites: filterUUIDs(favorites), source: 'server' }, false, 'syncFavoritesAfterLogin')
          useFavoritesStore.persist.clearStorage()
        },

        setFavorites: (favorites) => {
          set({ favorites: filterUUIDs(favorites) }, false, 'setFavorites')
        },

        mergeFavorites: (favorites, source = get().source) => {
          set(
            (state) => ({
              favorites: filterUUIDs([...state.favorites, ...favorites]),
              source,
            }),
            false,
            'mergeFavorites',
          )
        },

        resetLocalFavorites: () => {
          set({ favorites: [], source: 'local' }, false, 'resetLocalFavorites')
          useFavoritesStore.persist.clearStorage()
        },

        setOffset: (offset) => {
          set({ offset }, false, 'setOffset')
        },

        setSource: (source) => {
          set({ source })
        },
      }),
      {
        name: 'favorites-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          favorites: state.source === 'local' ? filterUUIDs(state.favorites) : [],
          source: 'local',
          offset: state.offset,
          limit: state.limit,
        }),
        merge: (persistedState, currentState) => {
          const state = persistedState as Partial<IFavoritesState>

          return {
            ...currentState,
            ...state,
            favorites: filterUUIDs(state.favorites ?? []),
          }
        },
      },
    ),
    { name: 'favorites-store' },
  ),
)

export const selectFavorites = (state: IFavoritesState) => ({
  favorites: state.favorites,
  offset: state.offset,
  limit: state.limit,
  source: state.source,
})

export const actionFavorites = (state: IFavoritesActions) => ({
  toggleFavorite: state.toggleFavorite,
  loadFavorites: state.loadFavorites,
  syncFavoritesAfterLogin: state.syncFavoritesAfterLogin,
  setFavorites: state.setFavorites,
  mergeFavorites: state.mergeFavorites,
  resetLocalFavorites: state.resetLocalFavorites,
  setOffset: state.setOffset,
})
