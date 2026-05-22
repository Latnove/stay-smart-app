import { AdminPage } from '@/pages/admin'
import { AuthPage } from '@/pages/auth'
import { EmailVerificationPage } from '@/pages/email-verification'
import { MyBookingsPage } from '@/pages/bookings/my-bookings'
import { FavoritesPage } from '@/pages/favorites'
import { ForbiddenPage } from '@/pages/forbidden'
import { HomePage } from '@/pages/home'
import { ListingCreatePage } from '@/pages/listings/listing-create/ui/ListingCreatePage'
import { ListingDetailsPage } from '@/pages/listings/listing-details/'
import { MyListingsPage } from '@/pages/listings/my-listings'
import { NotFoundPage } from '@/pages/not-found'
import { ProfilePage } from '@/pages/profile'
import { ROUTES } from '@/shared/config'
import { RequireRole } from '../providers/router/RequireRole'
import { AppLayout } from '../ui/AppLayout'

export const routes = [
  {
    element: <AppLayout />,
    children: [
      {
        path: ROUTES.HOME.path,
        element: <HomePage />,
      },
      { path: ROUTES.FAVORITES.path, element: <FavoritesPage /> },
      {
        path: ROUTES.MY_BOOKINGS.path,
        element: (
          <RequireRole roles={['user', 'admin']}>
            <MyBookingsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.LISTING_DETAILS.path,
        element: <ListingDetailsPage />,
      },
      {
        path: ROUTES.AUTH.path,
        element: <AuthPage />,
      },
      {
        path: ROUTES.VERIFICATION.path,
        element: <EmailVerificationPage />,
      },
      {
        path: ROUTES.FORBIDDEN.path,
        element: <ForbiddenPage />,
      },
      {
        path: ROUTES.LISTINGS_CREATE.path,
        element: <ListingCreatePage />,
      },
      {
        path: ROUTES.MY_LISTINGS.path,
        element: <MyListingsPage />,
      },
      {
        path: ROUTES.ADMIN.path,
        element: (
          <RequireRole roles={['admin']}>
            <AdminPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.PROFILE.path,
        element: (
          <RequireRole roles={['user', 'admin']}>
            <ProfilePage />
          </RequireRole>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]
