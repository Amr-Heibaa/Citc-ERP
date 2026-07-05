import { Navigate, Outlet } from 'react-router'

import { useTokenStore } from '@/stores/token-store'

export function ProtectedRoute() {
  const token = useTokenStore((s) => s.accessToken)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}