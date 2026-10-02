import { useQuery } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import { getSecurityDashboard } from "@/features/security/api/security-client";
import { securityRetry } from "@/features/security/api/security-query-options";

export function useSecurityDashboard() {
  return useQuery({
    queryKey: securityKeys.dashboard(),
    queryFn: () => getSecurityDashboard(),
    retry: securityRetry,
  });
}
