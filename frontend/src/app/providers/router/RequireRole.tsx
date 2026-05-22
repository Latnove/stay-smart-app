import { selectUser, useUserStore } from '@/entities/user'
import { ROUTES, type Role } from '@/shared/config'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'

interface IRequireRole {
  children: ReactNode
  roles: Array<Role>
}

export const RequireRole = ({ children, roles }: IRequireRole) => {
  const { user } = useUserStore(useShallow(selectUser))

  if (!user) {
    return <Navigate to={ROUTES.AUTH.path} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.FORBIDDEN.path} replace />
  }

  return children
}
