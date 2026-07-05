import { createBrowserRouter, Navigate } from 'react-router'

import { ProtectedRoute } from '@/app/protected-route'
import { LoginPage } from '@/features/auth/pages/login-page'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{ index: true, element: null }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])