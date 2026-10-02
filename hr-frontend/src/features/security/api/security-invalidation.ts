import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import type { SecurityAccess } from "@/features/security/api/security-types";

export function invalidateKeys(queryClient: QueryClient, keys: QueryKey[]) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

/** True when the signed-in actor is one of the affected accounts. */
export function affectsCurrentActor(queryClient: QueryClient, userIds: number[]): boolean {
  const access = queryClient.getQueryData<SecurityAccess>(securityKeys.access());
  return access?.userId != null && userIds.includes(access.userId);
}
