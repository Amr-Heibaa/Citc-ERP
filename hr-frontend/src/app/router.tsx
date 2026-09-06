import { useTranslation } from "react-i18next";
import { createBrowserRouter, Navigate } from "react-router";

import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/app/protected-route";
import { LoginPage } from "@/features/login/Page/login-page";
import { DashboardRouter } from "@/features/dashboard/pages/dashboard-router";
import { HrHomePage } from "@/features/hr/pages/hr-home-page";
import { EmployeesPage } from "@/features/hr/employees/pages/employees-page";
import { EmployeeDetailPage } from "@/features/hr/employees/pages/employee-detail-page";
import { EmployeeCreatePage } from "@/features/hr/employees/pages/employee-create-page";
import { EmployeeEditPage } from "@/features/hr/employees/pages/employee-edit-page";
import { DeletedEmployeesPage } from "@/features/hr/employees/pages/deleted-employees-page";
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
import { HrSettingsHomePage } from "@/features/hr/hr-settings/pages/hr-settings-home-page";
import { EmployeeStatusesPage } from "@/features/hr/hr-settings/pages/employee-statuses-page";
import { ContractTypesPage } from "@/features/hr/hr-settings/pages/contract-types-page";
import { ContractTemplatesPage } from "@/features/hr/hr-settings/pages/contract-templates-page";
import { SkillsPage } from "@/features/hr/hr-settings/pages/skills-page";
import { FunctionalRelationTypesPage } from "@/features/hr/hr-settings/pages/functional-relation-types-page";
import { SettingsHistoryPage } from "@/features/hr/hr-settings/pages/settings-history-page";
import { HrReportsHomePage } from "@/features/hr/reports/pages/hr-reports-home-page";
import { HiresResignationsReportPage } from "@/features/hr/reports/pages/hires-resignations-report-page";
import { ContractTypesReportPage } from "@/features/hr/reports/pages/contract-types-report-page";
import { HrAccessGate } from "@/features/hr/access-delegation/components/hr-access-gate";
import { AccessDelegationPage } from "@/features/hr/access-delegation/pages/access-delegation-page";
function Placeholder({ nameKey }: { nameKey: string }) {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <p className="font-['Inter',sans-serif] text-[15px] text-[#6b7280]">
        {t("common.comingSoonPage", { name: t(nameKey) })}
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
          { index: true, element: <DashboardRouter /> },
          {
            path: "notifications",
            element: <Placeholder nameKey="sidebar.notifications" />,
          },
          { path: "requests", element: <Placeholder nameKey="sidebar.requests" /> },
          { path: "projects", element: <Placeholder nameKey="sidebar.projects" /> },
          { path: "reports", element: <Placeholder nameKey="sidebar.reports" /> },
          { path: "settings", element: <Placeholder nameKey="sidebar.settings" /> },
          {
            path: "hr",
            element: <HrAccessGate />,
            children: [
              { index: true, element: <HrHomePage /> },
              { path: "employees", element: <EmployeesPage /> },
              { path: "employees/new", element: <EmployeeCreatePage /> },
              { path: "employees/deleted", element: <DeletedEmployeesPage /> },
              {
                path: "employees/:employeeId/edit",
                element: <EmployeeEditPage />,
              },
              {
                path: "employees/:employeeId",
                element: <EmployeeDetailPage />,
              },
              { path: "organizations", element: <OrganizationsPage /> },
              { path: "organizations/new", element: <OrganizationCreatePage /> },
              {
                path: "organizations/:organizationId/edit",
                element: <OrganizationEditPage />,
              },
              {
                path: "organizations/:organizationId",
                element: <OrganizationDetailPage />,
              },
              {
                path: "organizations/:organizationId/units/:orgUnitId",
                element: <OrganizationUnitDetailPage />,
              },

              { path: "jobs", element: <JobsHomePage /> },
              { path: "jobs/grades", element: <JobGradesPage /> },
              { path: "jobs/positions", element: <JobPositionsPage /> },
              { path: "jobs/positions/new", element: <JobPositionCreatePage /> },
              {
                path: "jobs/positions/:positionId/edit",
                element: <JobPositionEditPage />,
              },
              {
                path: "jobs/positions/:positionId",
                element: <JobPositionDetailPage />,
              },

              { path: "employment", element: <EmploymentHomePage /> },
              { path: "employment/records", element: <EmploymentRecordsPage /> },

              { path: "settings", element: <HrSettingsHomePage /> },
              { path: "settings/history", element: <SettingsHistoryPage /> },
              {
                path: "settings/employee-statuses",
                element: <EmployeeStatusesPage />,
              },
              { path: "settings/contract-types", element: <ContractTypesPage /> },
              {
                path: "settings/contract-templates",
                element: <ContractTemplatesPage />,
              },
              { path: "settings/skills", element: <SkillsPage /> },
              {
                path: "settings/functional-relation-types",
                element: <FunctionalRelationTypesPage />,
              },
              {
                path: "settings/access-delegation",
                element: <AccessDelegationPage />,
              },

              { path: "reports", element: <HrReportsHomePage /> },
              {
                path: "reports/hires-resignations",
                element: <HiresResignationsReportPage />,
              },
              {
                path: "reports/contract-types",
                element: <ContractTypesReportPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
