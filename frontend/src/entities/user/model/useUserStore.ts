import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import type { User } from './types'

interface IUserState {
  user: User | null
  accessToken: string | null
}

interface IUserActions {
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  clearUser: () => void
}

const initialState: IUserState = {
  user: null,
  accessToken: null,
}

export const useUserStore = create<IUserState & IUserActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setAuth: (user, accessToken) => set({ user, accessToken }, false, 'setAuth'),
        setUser: (user) => set({ user }, false, 'setUser'),
        clearUser: () => set({ ...initialState }, false, 'clearUser'),
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
        }),
      },
    ),
    { name: 'user-store' },
  ),
)

export const selectUser = (state: IUserState) => ({
  user: state.user,
  accessToken: state.accessToken,
})

export const actionUser = (state: IUserActions) => ({
  setAuth: state.setAuth,
  setUser: state.setUser,
  clearUser: state.clearUser,
})
