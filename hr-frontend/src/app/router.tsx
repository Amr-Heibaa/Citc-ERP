import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/app/protected-route'
import { LoginPage } from '@/features/login/Page/login-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'

function Placeholder({ name }: { name: string }) {
  return (
    <div className="p-6">
      <p className="font-['Inter',sans-serif] text-[15px] text-[#6b7280]">
        {name} page — coming soon.
      </p>
    </div>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'notifications', element: <Placeholder name="Notifications" /> },
          { path: 'requests', element: <Placeholder name="Requests" /> },
          { path: 'projects', element: <Placeholder name="Projects" /> },
          { path: 'reports', element: <Placeholder name="Reports" /> },
          { path: 'settings', element: <Placeholder name="Settings" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])