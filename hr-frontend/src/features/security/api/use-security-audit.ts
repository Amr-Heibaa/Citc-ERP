import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import { listAuditLogs } from "@/features/security/api/security-client";
import { securityRetry } from "@/features/security/api/security-query-options";
import type { SecurityPageParams } from "@/features/security/api/security-types";

/**
 * SYSTEM_ADMIN only. Returns 501 until audit persistence is enabled on the
 * backend (security.audit.enabled=true) — callers render a dedicated
 * "not enabled" state for that status.
 */
export function useSecurityAuditLogs(params: SecurityPageParams, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.auditLogs(params),
    queryFn: () => listAuditLogs(params),
    enabled,
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}
