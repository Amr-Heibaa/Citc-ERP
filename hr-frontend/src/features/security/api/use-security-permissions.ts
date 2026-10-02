import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import {
  createPermission,
  fetchAllSecurityPages,
  getPermission,
  listPermissionRoles,
  listPermissions,
  setPermissionRoles,
  updatePermission,
} from "@/features/security/api/security-client";
import { invalidateKeys } from "@/features/security/api/security-invalidation";
import {
  embeddedFirstPage,
  isValidId,
  securityRetry,
} from "@/features/security/api/security-query-options";
import type {
  SecurityPage,
  SecurityPageParams,
  SecurityRoleSummary,
  SecurityPermissionRequest,
  SecurityPermissionsParams,
} from "@/features/security/api/security-types";

export function useSecurityPermissions(params: SecurityPermissionsParams) {
  return useQuery({
    queryKey: securityKeys.permissionList(params),
    queryFn: () => listPermissions(params),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** Every permission, for assignment pickers (walks all pages). */
export function useAllSecurityPermissions(enabled = true) {
  return useQuery({
    queryKey: securityKeys.allPermissions(),
    queryFn: () => fetchAllSecurityPages((params) => listPermissions(params)),
    enabled,
    retry: securityRetry,
  });
}

export function useSecurityPermission(permissionId: number) {
  return useQuery({
    queryKey: securityKeys.permission(permissionId),
    queryFn: () => getPermission(permissionId),
    enabled: isValidId(permissionId),
    retry: securityRetry,
  });
}

export function useSecurityPermissionRoles(
  permissionId: number,
  params: SecurityPageParams,
  firstPage?: SecurityPage<SecurityRoleSummary>,
) {
  return useQuery({
    queryKey: securityKeys.permissionRoles(permissionId, params),
    queryFn: () => listPermissionRoles(permissionId, params),
    initialData: embeddedFirstPage(params, firstPage),
    enabled: isValidId(permissionId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

export function useAllSecurityPermissionRoles(permissionId: number, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.permissionRoles(permissionId, "all"),
    queryFn: () => fetchAllSecurityPages((params) => listPermissionRoles(permissionId, params)),
    enabled: enabled && isValidId(permissionId),
    retry: securityRetry,
  });
}

export function useCreateSecurityPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecurityPermissionRequest) => createPermission(request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.permissions(),
        securityKeys.modules(),
        securityKeys.dashboard(),
      ]);
    },
  });
}

export function useUpdateSecurityPermission(permissionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecurityPermissionRequest) => updatePermission(permissionId, request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.permissions(),
        securityKeys.modules(),
        securityKeys.roles(),
        securityKeys.userDetails(),
        securityKeys.dashboard(),
        securityKeys.access(),
      ]);
    },
  });
}

export function useSetSecurityPermissionRoles(permissionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleIds: number[]) => setPermissionRoles(permissionId, roleIds),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.permission(permissionId),
        securityKeys.permissions(),
        securityKeys.roles(),
        securityKeys.userDetails(),
        securityKeys.access(),
      ]);
    },
  });
}
