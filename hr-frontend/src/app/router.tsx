import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/app/protected-route'
import { LoginPage } from '@/features/auth/pages/login-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [{ index: true, element: <DashboardPage /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])