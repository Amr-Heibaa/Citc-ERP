import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getMyAccess } from "@/features/security/api/security-client";
import { securityKeys } from "@/features/security/api/query-keys";
import { securityRetry } from "@/features/security/api/security-query-options";
import { getSecurityCapabilities } from "@/features/security/utils/security-access";

const ACCESS_STALE_TIME = 5 * 60 * 1000;

/** Live effective access of the signed-in user plus derived UI capabilities. */
export function useSecurityAccess() {
  const query = useQuery({
    queryKey: securityKeys.access(),
    queryFn: getMyAccess,
    staleTime: ACCESS_STALE_TIME,
    retry: securityRetry,
  });

  const capabilities = useMemo(() => getSecurityCapabilities(query.data), [query.data]);

  return { ...query, capabilities };
}
