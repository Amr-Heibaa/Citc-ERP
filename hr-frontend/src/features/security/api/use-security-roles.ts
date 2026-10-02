import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import {
  createRole,
  fetchAllSecurityPages,
  getRole,
  listRolePermissions,
  listRoleUsers,
  listRoles,
  setRoleActive,
  setRolePermissions,
  setRoleUsers,
  updateRole,
} from "@/features/security/api/security-client";
import { affectsCurrentActor, invalidateKeys } from "@/features/security/api/security-invalidation";
import {
  embeddedFirstPage,
  isValidId,
  securityRetry,
} from "@/features/security/api/security-query-options";
import type {
  SecurityPage,
  SecurityPageParams,
  SecurityPermissionSummary,
  SecurityUserSummary,
  SecurityRoleRequest,
  SecurityRolesParams,
} from "@/features/security/api/security-types";

export function useSecurityRoles(params: SecurityRolesParams) {
  return useQuery({
    queryKey: securityKeys.roleList(params),
    queryFn: () => listRoles(params),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** Every role, for filters and assignment pickers (walks all pages). */
export function useAllSecurityRoles(enabled = true) {
  return useQuery({
    queryKey: securityKeys.allRoles(),
    queryFn: () => fetchAllSecurityPages((params) => listRoles(params)),
    enabled,
    retry: securityRetry,
  });
}

export function useSecurityRole(roleId: number) {
  return useQuery({
    queryKey: securityKeys.role(roleId),
    queryFn: () => getRole(roleId),
    enabled: isValidId(roleId),
    retry: securityRetry,
  });
}

export function useSecurityRoleUsers(
  roleId: number,
  params: SecurityPageParams,
  firstPage?: SecurityPage<SecurityUserSummary>,
) {
  return useQuery({
    queryKey: securityKeys.roleUsers(roleId, params),
    queryFn: () => listRoleUsers(roleId, params),
    initialData: embeddedFirstPage(params, firstPage),
    enabled: isValidId(roleId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

export function useAllSecurityRoleUsers(roleId: number, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.roleUsers(roleId, "all"),
    queryFn: () => fetchAllSecurityPages((params) => listRoleUsers(roleId, params)),
    enabled: enabled && isValidId(roleId),
    retry: securityRetry,
  });
}

export function useSecurityRolePermissions(
  roleId: number,
  params: SecurityPageParams,
  firstPage?: SecurityPage<SecurityPermissionSummary>,
) {
  return useQuery({
    queryKey: securityKeys.rolePermissions(roleId, params),
    queryFn: () => listRolePermissions(roleId, params),
    initialData: embeddedFirstPage(params, firstPage),
    enabled: isValidId(roleId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

export function useAllSecurityRolePermissions(roleId: number, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.rolePermissions(roleId, "all"),
    queryFn: () => fetchAllSecurityPages((params) => listRolePermissions(roleId, params)),
    enabled: enabled && isValidId(roleId),
    retry: securityRetry,
  });
}

export function useCreateSecurityRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecurityRoleRequest) => createRole(request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [securityKeys.roles(), securityKeys.dashboard()]);
    },
  });
}

export function useUpdateSecurityRole(roleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecurityRoleRequest) => updateRole(roleId, request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.roles(),
        // Role names/codes are embedded in user and permission rows.
        securityKeys.users(),
        securityKeys.permissions(),
        securityKeys.dashboard(),
        securityKeys.access(),
      ]);
    },
  });
}

export function useSetSecurityRoleActive(roleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (active: boolean) => setRoleActive(roleId, active),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.roles(),
        securityKeys.users(),
        securityKeys.dashboard(),
        securityKeys.access(),
      ]);
    },
  });
}

export function useSetSecurityRoleUsers(roleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds }: { userIds: number[]; previousUserIds: number[] }) =>
      setRoleUsers(roleId, userIds),
    onSuccess: async (_data, { userIds, previousUserIds }) => {
      const touched = [...userIds, ...previousUserIds];
      await invalidateKeys(queryClient, [
        securityKeys.role(roleId),
        securityKeys.roles(),
        securityKeys.users(),
        securityKeys.permissions(),
        securityKeys.dashboard(),
        ...(affectsCurrentActor(queryClient, touched) ? [securityKeys.access()] : []),
      ]);
    },
  });
}

export function useSetSecurityRolePermissions(roleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionIds: number[]) => setRolePermissions(roleId, permissionIds),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.roles(),
        securityKeys.permissions(),
        // Effective permissions of every holder of the role change.
        securityKeys.userDetails(),
        securityKeys.modules(),
        securityKeys.access(),
      ]);
    },
  });
}
