import 'normalize.css'
import { actionFavorites, useFavoritesStore } from '@/entities/favorite'
import { actionUser, selectUser, useUserStore } from '@/entities/user'
import { getMe } from '@/shared/api'
import { mapUser, refreshAccessToken, unwrapApi } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/shallow'
import { AppRouter, ThemeProvider } from './providers'
import './styles/index.css'
import './styles/variables.css'

function App() {
  const { accessToken } = useUserStore(useShallow(selectUser))
  const { clearUser, setUser } = useUserStore(useShallow(actionUser))
  const { loadFavorites } = useFavoritesStore(useShallow(actionFavorites))
  const isRefreshChecked = useRef(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!accessToken && !isRefreshChecked.current) {
          isRefreshChecked.current = true
          const nextAccessToken = await refreshAccessToken()

          if (!nextAccessToken) {
            return
          }
        }

        const user = await unwrapApi(getMe())
        setUser(mapUser(user))
        await loadFavorites()
      } catch {
        clearUser()
      }
    }

    loadUser()
  }, [accessToken, clearUser, loadFavorites, setUser])

  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
