import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { InfoRow } from "@/features/hr/shared/components/info-row";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { useGetMyAccess } from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";
import type { SecurityUserDetail } from "@/features/security/api/security-types";
import { SecurityCard } from "@/features/security/components/security-card";
import { isUserActive } from "@/features/security/utils/assignment-items";
import { formatDateTime } from "@/features/security/utils/format";

export function UserOverviewTab({ detail }: { detail: SecurityUserDetail }) {
  const { t } = useTranslation();
  const { account, loginStatistics } = detail;
  const hrAccess = useGetMyAccess({ query: { retry: false } });
  const canOpenEmployee = (hrAccess.data?.canViewHr ?? false) && account.employeeId != null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SecurityCard title={t("security.users.detail.account")}>
        <div className="flex flex-col gap-2">
          <InfoRow
            label={t("security.fields.status")}
            value={<StatusBadge active={isUserActive(account)} />}
          />
          <InfoRow label={t("security.fields.username")} value={account.username} />
          <InfoRow label={t("security.fields.email")} value={account.email} />
          <InfoRow
            label={t("security.fields.lastAccess")}
            value={account.lastAccess ? formatDateTime(account.lastAccess) : t("security.users.never")}
          />
          <InfoRow label={t("security.fields.createdAt")} value={formatDateTime(account.createdAt)} />
          <InfoRow label={t("security.fields.updatedAt")} value={formatDateTime(account.updatedAt)} />
        </div>
      </SecurityCard>

      <div className="flex flex-col gap-4">
        <SecurityCard title={t("security.users.detail.linkedEmployee")}>
          {account.employeeId == null ? (
            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              {t("security.users.detail.noEmployee")}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <InfoRow label={t("security.fields.displayName")} value={account.displayName} />
              <InfoRow label={t("security.fields.employeeNumber")} value={account.employeeNumber} />
              <InfoRow label={t("security.fields.employeeId")} value={account.employeeId} />
              {canOpenEmployee && (
                <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
                  <Link to={`/hr/employees/${account.employeeId}`}>
                    {t("security.users.detail.viewEmployee")}
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </SecurityCard>

        <SecurityCard title={t("security.users.detail.loginStatistics")}>
          <div className="flex flex-col gap-2">
            <InfoRow
              label={t("security.users.detail.attempts")}
              value={loginStatistics.attempts.toLocaleString("en-US")}
            />
            <InfoRow
              label={t("security.users.detail.successfulAttempts")}
              value={loginStatistics.successfulAttempts.toLocaleString("en-US")}
            />
            <InfoRow
              label={t("security.users.detail.failedAttempts")}
              value={loginStatistics.failedAttempts.toLocaleString("en-US")}
            />
          </div>
          <p className="mt-3 font-['Inter',sans-serif] text-xs text-gray-400">
            {t("security.users.detail.loginStatisticsHint")}
          </p>
        </SecurityCard>
      </div>
    </div>
  );
}
