import { selectUser, useUserStore } from '@/entities/user'
import { ROUTES } from '@/shared/config'
import { Logo } from '@/shared/ui/Logo/Logo'
import clsx from 'clsx'
import { NavLink, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import styles from './Header.module.css'

export const Header = () => {
  const navigate = useNavigate()
  const { user } = useUserStore(useShallow(selectUser))

  return (
    <header className={styles.header}>
      <div className={clsx('container', styles.list)}>
        <Logo onClick={() => navigate(ROUTES.HOME.path)} />

        <nav className={styles.nav}>
          {Object.values(ROUTES)
            .filter((el) => !el.isNotMap && (!el.roles || (user ? el.roles.includes(user.role) : !el.roles.length)))
            .map((route) => (
              <NavLink className={styles.link} to={route.path} end key={route.path}>
                {route.text}
              </NavLink>
            ))}

          {((user?.role === 'user' && user.verified === 'verified') || user?.role === 'admin') && (
            <NavLink className={styles.link} to={ROUTES.LISTINGS_CREATE.path} end key={ROUTES.LISTINGS_CREATE.path}>
              {ROUTES.LISTINGS_CREATE.text}
            </NavLink>
          )}

          {!user ? (
            <NavLink className={styles.link} to={ROUTES.AUTH.path} end key={ROUTES.AUTH.path}>
              {ROUTES.AUTH.text}
            </NavLink>
          ) : (
            <NavLink className={styles.link} to={ROUTES.PROFILE.path} end key={ROUTES.PROFILE.path}>
              {ROUTES.PROFILE.text}
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
