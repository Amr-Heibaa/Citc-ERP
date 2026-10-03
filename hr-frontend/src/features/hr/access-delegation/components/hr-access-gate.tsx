import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router";

import { useHrCapabilities } from "@/features/hr/shared/access/use-hr-capabilities";

export function HrAccessGate() {
  const { t } = useTranslation();
  const { capabilities, isLoading } = useHrCapabilities();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
        {t("dashboard.checkingAccess")}
      </div>
    );
  }

  if (!capabilities.canEnterHr) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
