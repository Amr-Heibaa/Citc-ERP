import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  grantAccess,
  revokeAccess,
  useGetMyAccess,
  useListGrants,
} from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";
import { useListEmployees } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import type {
  GrantHrAccessRequest,
  RevokeHrAccessRequest,
} from "@/lib/api/generated/model";

import { isHrAccessQueryKey } from "@/features/hr/access-delegation/api/query-keys";

const ACCESS_STALE_TIME = 5 * 60 * 1000;

export function useMyHrAccess() {
  return useGetMyAccess({
    query: { staleTime: ACCESS_STALE_TIME, retry: false },
  });
}

export function useAccessGrants() {
  return useListGrants();
}

export function useEmployeesForGrant() {
  return useListEmployees();
}

export function useGrantHrAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantHrAccessRequest) => grantAccess(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isHrAccessQueryKey(query.queryKey),
      });
    },
  });
}

export function useRevokeHrAccess(grantId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeHrAccessRequest) => revokeAccess(grantId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isHrAccessQueryKey(query.queryKey),
      });
    },
  });
}
