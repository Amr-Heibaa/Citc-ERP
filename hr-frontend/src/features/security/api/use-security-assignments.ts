import { useMutation, useQueryClient } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import {
  bulkAssignRolePermissions,
  bulkAssignUserRoles,
} from "@/features/security/api/security-client";
import { affectsCurrentActor, invalidateKeys } from "@/features/security/api/security-invalidation";
import type {
  BulkRolePermissionsRequest,
  BulkUserRolesRequest,
} from "@/features/security/api/security-types";

export function useBulkAssignUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkUserRolesRequest) => bulkAssignUserRoles(request),
    onSuccess: async (_data, request) => {
      await invalidateKeys(queryClient, [
        securityKeys.users(),
        securityKeys.roles(),
        securityKeys.permissions(),
        securityKeys.dashboard(),
        ...(affectsCurrentActor(queryClient, request.userIds) ? [securityKeys.access()] : []),
      ]);
    },
  });
}

export function useBulkAssignRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkRolePermissionsRequest) => bulkAssignRolePermissions(request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.roles(),
        securityKeys.permissions(),
        securityKeys.modules(),
        securityKeys.userDetails(),
        securityKeys.access(),
      ]);
    },
  });
}
