import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { AccessDeniedState } from "@/features/security/components/security-states";
import type { HrCapabilities } from "@/features/hr/shared/access/hr-capabilities";
import { useHrCapabilities } from "@/features/hr/shared/access/use-hr-capabilities";

type HrCapabilityKey = {
  [K in keyof HrCapabilities]: K extends `can${string}` ? K : never;
}[keyof HrCapabilities];

/**
 * Route guard for a group of /hr routes. Shows the Access Denied state for a
 * manually typed URL (no redirect, so no loop) and never renders protected
 * content while authorization is still loading.
 */
export function HrCapabilityGate({ capability }: { capability: HrCapabilityKey }) {
  const { t } = useTranslation();
  const { capabilities, isLoading } = useHrCapabilities();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
        {t("dashboard.checkingAccess")}
      </div>
    );
  }

  if (!capabilities[capability]) {
    return <AccessDeniedState description={t("hrAccess.deniedDescription")} />;
  }

  return <Outlet />;
}
