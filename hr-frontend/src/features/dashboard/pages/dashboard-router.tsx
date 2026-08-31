import { useTranslation } from "react-i18next";

import { AdminDashboardPage } from "@/features/dashboard/pages/admin-dashboard-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { useGetMyAccess } from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";

export function DashboardRouter() {
  const { t } = useTranslation();
  const access = useGetMyAccess({ query: { retry: false } });

  if (access.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (access.data?.canViewHr) {
    return <AdminDashboardPage />;
  }

  return <DashboardPage />;
}
