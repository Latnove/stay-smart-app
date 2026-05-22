import { type Role } from './roles'

interface IRoute {
  path: string
  text: string
  roles?: Role[]
  isNotMap?: boolean
}

type Routes =
  | 'HOME'
  | 'FAVORITES'
  | 'AUTH'
  | 'VERIFICATION'
  | 'PROFILE'
  | 'LISTING_DETAILS'
  | 'LISTINGS_CREATE'
  | 'MY_LISTINGS'
  | 'MY_BOOKINGS'
  | 'ADMIN'
  | 'FORBIDDEN'

export const ROUTES: Record<Routes, IRoute> = {
  HOME: {
    path: '/',
    text: 'Главная',
  },
  ADMIN: {
    path: '/admin',
    text: 'Админка',
    roles: ['admin'],
  },
  FAVORITES: {
    path: '/favorites',
    text: 'Избранное',
  },
  MY_BOOKINGS: {
    path: '/my-bookings',
    text: 'Мои бронирования',
    roles: ['user', 'admin'],
  },
  FORBIDDEN: {
    path: '/forbidden',
    text: 'Доступ запрещен',
    isNotMap: true,
  },
  AUTH: {
    path: '/auth',
    text: 'Авторизация',
    isNotMap: true,
    roles: [],
  },
  VERIFICATION: {
    path: '/verification',
    text: 'Подтверждение почты',
    isNotMap: true,
  },
  PROFILE: {
    path: '/profile',
    text: 'Личный кабинет',
    isNotMap: true,
    roles: ['user', 'admin'],
  },
  LISTING_DETAILS: {
    path: '/listings/:listingId',
    text: 'Объявление',
    isNotMap: true,
  },
  LISTINGS_CREATE: {
    path: '/listings/create',
    text: 'Создание объявления',
    roles: ['user', 'admin'],
    isNotMap: true,
  },
  MY_LISTINGS: {
    path: '/my-listings',
    text: 'Мои объявления',
    roles: ['user', 'admin'],
  },
} as const
