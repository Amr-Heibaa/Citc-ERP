import { useMemo } from "react";

import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useGetMyAccess } from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";

import { resolveHrCapabilities } from "@/features/hr/shared/access/hr-capabilities";

const ACCESS_STALE_TIME = 5 * 60 * 1000;

/**
 * HR capabilities for the signed-in user. Reuses the existing React Query
 * caches for /api/security/me/access and /api/hr/access/me (same query keys
 * as every other caller, so no duplicate requests).
 *
 * A failed source contributes no access; `isLoading` stays true until both
 * sources have settled so guards never flash protected content.
 */
export function useHrCapabilities() {
  const security = useSecurityAccess();
  const legacy = useGetMyAccess({ query: { staleTime: ACCESS_STALE_TIME, retry: false } });

  const capabilities = useMemo(
    () => resolveHrCapabilities(security.data, legacy.data),
    [security.data, legacy.data],
  );

  return {
    capabilities,
    isLoading: security.isLoading || legacy.isLoading,
  };
}
