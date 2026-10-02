import { DatabaseZap } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useSecurityAuditLogs } from "@/features/security/api/use-security-audit";
import { AuditRecordsTable } from "@/features/security/components/audit-records-table";
import { SecurityCard } from "@/features/security/components/security-card";
import { SecurityPageHeader } from "@/features/security/components/security-page-header";
import { useSecurityFiltersStore } from "@/features/security/store/security-filters-store";
import { getApiStatus } from "@/features/security/utils/security-errors";

function AuditUnavailableState() {
  const { t } = useTranslation();

  return (
    <div role="status" className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[#f5841f]/10 text-[#f5841f]">
        <DatabaseZap className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-lg">
        <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
          {t("security.audit.unavailableTitle")}
        </p>
        <p className="mt-1 font-['Inter',sans-serif] text-sm text-gray-400">
          {t("security.audit.unavailableDescription")}
        </p>
      </div>
    </div>
  );
}

/** SYSTEM_ADMIN only (guarded at the route). */
export function SecurityAuditLogsPage() {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const page = useSecurityFiltersStore((state) => state.lists.auditLogs.page);
  const setPage = useSecurityFiltersStore((state) => state.setPage);

  const logs = useSecurityAuditLogs(
    { page, size: SECURITY_DEFAULT_PAGE_SIZE },
    capabilities.canViewAuditLogs,
  );

  // 501: persistence is intentionally disabled until security.audit.enabled=true.
  const unavailable = getApiStatus(logs.error) === 501;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityPageHeader title={t("security.audit.title")} subtitle={t("security.audit.subtitle")} />

      <SecurityCard flush>
        {unavailable ? (
          <AuditUnavailableState />
        ) : (
          <AuditRecordsTable
            data={logs.data}
            isLoading={logs.isLoading}
            isFetching={logs.isFetching}
            error={logs.error}
            onRetry={() => logs.refetch()}
            onPageChange={(next) => setPage("auditLogs", next)}
            emptyTitle={t("security.audit.empty")}
            emptyDescription={t("security.audit.emptyHint")}
            caption={t("security.audit.title")}
          />
        )}
      </SecurityCard>
    </div>
  );
}
