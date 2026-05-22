import { routes } from '@/app/routes'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter(routes)

export const AppRouter = () => {
  return <RouterProvider router={router} />
}
