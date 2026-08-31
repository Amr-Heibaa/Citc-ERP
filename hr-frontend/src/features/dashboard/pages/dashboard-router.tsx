import { Navigate } from "react-router";

import { AdminDashboardPage } from "@/features/dashboard/pages/admin-dashboard-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { useGetMyAccess } from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";

export function DashboardRouter() {
  const access = useGetMyAccess({ query: { retry: false } });

  if (access.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  if (access.data?.canManageDelegation) {
    return <AdminDashboardPage />;
  }

  if (access.data?.canViewHr) {
    return <Navigate to="/hr" replace />;
  }

  return <DashboardPage />;
}
