import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, type CreateUserRequest } from "@/lib/api/auth";

import { securityKeys } from "@/features/security/api/query-keys";
import {
  fetchAllSecurityPages,
  getUser,
  listUserActivity,
  listUserPermissions,
  listUserRoles,
  listUserSessions,
  listUsers,
  setUserActive,
  setUserRoles,
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
  SecurityRoleSummary,
  SecurityUsersParams,
} from "@/features/security/api/security-types";

export function useSecurityUsers(params: SecurityUsersParams) {
  return useQuery({
    queryKey: securityKeys.userList(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** Every user account, for assignment pickers (walks all pages). */
export function useAllSecurityUsers(enabled = true) {
  return useQuery({
    queryKey: securityKeys.allUsers(),
    queryFn: () => fetchAllSecurityPages((params) => listUsers(params)),
    enabled,
    retry: securityRetry,
  });
}

export function useSecurityUser(userId: number) {
  return useQuery({
    queryKey: securityKeys.user(userId),
    queryFn: () => getUser(userId),
    enabled: isValidId(userId),
    retry: securityRetry,
  });
}

export function useSecurityUserRoles(
  userId: number,
  params: SecurityPageParams,
  firstPage?: SecurityPage<SecurityRoleSummary>,
) {
  return useQuery({
    queryKey: securityKeys.userRoles(userId, params),
    queryFn: () => listUserRoles(userId, params),
    initialData: embeddedFirstPage(params, firstPage),
    enabled: isValidId(userId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** Complete current role set of a user, for the replace-style role editor. */
export function useAllSecurityUserRoles(userId: number) {
  return useQuery({
    queryKey: securityKeys.userRoles(userId, "all"),
    queryFn: () => fetchAllSecurityPages((params) => listUserRoles(userId, params)),
    enabled: isValidId(userId),
    retry: securityRetry,
  });
}

export function useSecurityUserPermissions(
  userId: number,
  params: SecurityPageParams,
  firstPage?: SecurityPage<SecurityPermissionSummary>,
) {
  return useQuery({
    queryKey: securityKeys.userPermissions(userId, params),
    queryFn: () => listUserPermissions(userId, params),
    initialData: embeddedFirstPage(params, firstPage),
    enabled: isValidId(userId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** SYSTEM_ADMIN only — callers must pass enabled=false for anyone else. */
export function useSecurityUserSessions(userId: number, params: SecurityPageParams, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.userSessions(userId, params),
    queryFn: () => listUserSessions(userId, params),
    enabled: enabled && isValidId(userId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** SYSTEM_ADMIN only — callers must pass enabled=false for anyone else. */
export function useSecurityUserActivity(userId: number, params: SecurityPageParams, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.userActivity(userId, params),
    queryFn: () => listUserActivity(userId, params),
    enabled: enabled && isValidId(userId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

export function useSetUserActive(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (active: boolean) => setUserActive(userId, active),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.userLists(),
        securityKeys.allUsers(),
        securityKeys.user(userId),
        securityKeys.dashboard(),
        ...(affectsCurrentActor(queryClient, [userId]) ? [securityKeys.access()] : []),
      ]);
    },
  });
}

export function useSetUserRoles(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleIds: number[]) => setUserRoles(userId, roleIds),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.user(userId),
        securityKeys.userLists(),
        securityKeys.allUsers(),
        // userCount on role rows and role detail user lists change.
        securityKeys.roles(),
        securityKeys.permissions(),
        securityKeys.dashboard(),
        ...(affectsCurrentActor(queryClient, [userId]) ? [securityKeys.access()] : []),
      ]);
    },
  });
}

/** Existing account-creation endpoint (POST /api/auth/users). */
export function useCreateSecurityUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserRequest) => createUser(request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.userLists(),
        securityKeys.allUsers(),
        securityKeys.dashboard(),
      ]);
    },
  });
}
