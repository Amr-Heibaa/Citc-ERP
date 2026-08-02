import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/app/protected-route'
import { LoginPage } from '@/features/login/Page/login-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { EmployeesPage } from '@/features/hr/pages/employees-page'
import { EmployeeCreatePage } from '@/features/hr/pages/employee-create-page'
import { HrHomePage } from '@/features/hr/pages/hr-home-page'
import { EmployeeDetailPage } from '@/features/hr/pages/employee-detail-page'
import { EmployeeEditPage } from '@/features/hr/pages/employee-edit-page'
import { OrganizationsPage } from '@/features/hr/pages/organizations-page'
import { DepartmentsPage } from '@/features/hr/pages/departments-page'

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
          { path: 'hr', element: <HrHomePage /> },
          { path: 'hr/employees/new', element: <EmployeeCreatePage /> },
          { path: 'hr/employees', element: <EmployeesPage /> },
          { path: 'hr/employees', element: <EmployeesPage /> },
          { path: 'hr/employees/new', element: <EmployeeCreatePage /> },
          { path: 'hr/employees', element: <EmployeesPage /> },
          { path: 'hr', element: <HrHomePage /> },
          { path: 'hr/employees/new', element: <EmployeeCreatePage /> },
          { path: 'hr/employees/:employeeId', element: <EmployeeDetailPage /> },
          { path: 'hr/employees', element: <EmployeesPage /> },
          { path: 'hr/employees/new', element: <EmployeeCreatePage /> },
          { path: 'hr/employees/:employeeId/edit', element: <EmployeeEditPage /> },
          { path: 'hr/employees/:employeeId', element: <EmployeeDetailPage /> },
          { path: 'hr/employees', element: <EmployeesPage /> },
          { path: 'hr/organizations', element: <OrganizationsPage /> },
          { path: 'hr/departments', element: <DepartmentsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])