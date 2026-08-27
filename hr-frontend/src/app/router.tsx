import { createBrowserRouter, Navigate } from "react-router";

import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/app/protected-route";
import { LoginPage } from "@/features/login/Page/login-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { HrHomePage } from "@/features/hr/pages/hr-home-page";
import { EmployeesPage } from "@/features/hr/employees/pages/employees-page";
import { EmployeeDetailPage } from "@/features/hr/employees/pages/employee-detail-page";
import { EmployeeCreatePage } from "@/features/hr/employees/pages/employee-create-page";
import { EmployeeEditPage } from "@/features/hr/employees/pages/employee-edit-page";
import { OrganizationsPage } from "@/features/hr/organizations/pages/organizations-page";
import { OrganizationDetailPage } from "@/features/hr/organizations/pages/organization-detail-page";
import { OrganizationCreatePage } from "@/features/hr/organizations/pages/organization-create-page";
import { OrganizationEditPage } from "@/features/hr/organizations/pages/organization-edit-page";
import { OrganizationUnitDetailPage } from "@/features/hr/organizations/pages/organization-unit-detail-page";
import { JobsHomePage } from "@/features/hr/jobs/pages/jobs-home-page";
import { JobGradesPage } from "@/features/hr/jobs/pages/job-grades-page";
import { JobPositionsPage } from "@/features/hr/jobs/pages/job-positions-page";
import { JobPositionCreatePage } from "@/features/hr/jobs/pages/job-position-create-page";
import { JobPositionEditPage } from "@/features/hr/jobs/pages/job-position-edit-page";
import { JobPositionDetailPage } from "@/features/hr/jobs/pages/job-position-detail-page";
import { EmploymentHomePage } from "@/features/hr/employment/pages/employment-home-page";
import { EmploymentRecordsPage } from "@/features/hr/employment/pages/employment-records-page";
function Placeholder({ name }: { name: string }) {
  return (
    <div className="p-6">
      <p className="font-['Inter',sans-serif] text-[15px] text-[#6b7280]">
        {name} page — coming soon.
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: "notifications",
            element: <Placeholder name="Notifications" />,
          },
          { path: "requests", element: <Placeholder name="Requests" /> },
          { path: "projects", element: <Placeholder name="Projects" /> },
          { path: "reports", element: <Placeholder name="Reports" /> },
          { path: "settings", element: <Placeholder name="Settings" /> },
          { path: "hr", element: <HrHomePage /> },
          { path: "hr/employees", element: <EmployeesPage /> },
          { path: "hr/employees/new", element: <EmployeeCreatePage /> },
          {
            path: "hr/employees/:employeeId/edit",
            element: <EmployeeEditPage />,
          },
          {
            path: "hr/employees/:employeeId",
            element: <EmployeeDetailPage />,
          },
          { path: "hr/organizations", element: <OrganizationsPage /> },
          { path: "hr/organizations/new", element: <OrganizationCreatePage /> },
          {
            path: "hr/organizations/:organizationId/edit",
            element: <OrganizationEditPage />,
          },
          {
            path: "hr/organizations/:organizationId",
            element: <OrganizationDetailPage />,
          },

          {
            path: "hr/organizations/:organizationId/units/:orgUnitId",
            element: <OrganizationUnitDetailPage />,
          },

          { path: "hr/jobs", element: <JobsHomePage /> },
          { path: "hr/jobs/grades", element: <JobGradesPage /> },
          { path: "hr/jobs/positions", element: <JobPositionsPage /> },
          { path: "hr/jobs/positions/new", element: <JobPositionCreatePage /> },
          {
            path: "hr/jobs/positions/:positionId/edit",
            element: <JobPositionEditPage />,
          },
          {
            path: "hr/jobs/positions/:positionId",
            element: <JobPositionDetailPage />,
          },

          { path: "hr/employment", element: <EmploymentHomePage /> },
          { path: "hr/employment/records", element: <EmploymentRecordsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
