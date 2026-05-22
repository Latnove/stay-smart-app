import type { VerifiedType } from '@/entities/user'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type AdminVerificationFilter = VerifiedType | 'all' | 'blocked'
export type AdminUsersSortOrder = 'newest' | 'oldest'

interface AdminUserFiltersState {
  search: string
  verificationFilter: AdminVerificationFilter
  sortOrder: AdminUsersSortOrder
}

interface AdminUserFiltersActions {
  setSearch: (search: string) => void
  setVerificationFilter: (verificationFilter: AdminVerificationFilter) => void
  setSortOrder: (sortOrder: AdminUsersSortOrder) => void
}

const initialState: AdminUserFiltersState = {
  search: '',
  verificationFilter: 'all',
  sortOrder: 'newest',
}

export const useAdminUserFiltersStore = create<AdminUserFiltersState & AdminUserFiltersActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setSearch: (search) => set({ search }, false, 'setAdminUsersSearch'),
      setVerificationFilter: (verificationFilter) =>
        set({ verificationFilter }, false, 'setAdminUsersVerificationFilter'),
      setSortOrder: (sortOrder) => set({ sortOrder }, false, 'setAdminUsersSortOrder'),
    }),
    { name: 'admin-user-filters-store' },
  ),
)

export const selectAdminUserFilters = (state: AdminUserFiltersState) => ({
  search: state.search,
  verificationFilter: state.verificationFilter,
  sortOrder: state.sortOrder,
})

export const actionAdminUserFilters = (state: AdminUserFiltersActions) => ({
  setSearch: state.setSearch,
  setVerificationFilter: state.setVerificationFilter,
  setSortOrder: state.setSortOrder,
})
