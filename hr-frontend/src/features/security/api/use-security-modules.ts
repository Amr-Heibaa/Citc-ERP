import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { securityKeys } from "@/features/security/api/query-keys";
import {
  createModule,
  fetchAllSecurityPages,
  getModule,
  listModulePermissions,
  listModules,
  setModulePermissions,
  updateModule,
} from "@/features/security/api/security-client";
import { invalidateKeys } from "@/features/security/api/security-invalidation";
import {
  embeddedFirstPage,
  isValidId,
  securityRetry,
} from "@/features/security/api/security-query-options";
import type {
  SecurityModuleRequest,
  SecurityPage,
  SecurityPermissionSummary,
  SecurityModulesParams,
  SecurityPageParams,
} from "@/features/security/api/security-types";

export function useSecurityModules(params: SecurityModulesParams) {
  return useQuery({
    queryKey: securityKeys.moduleList(params),
    queryFn: () => listModules(params),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

/** Every application module, for filters and form selects. */
export function useAllSecurityModules(enabled = true) {
  return useQuery({
    queryKey: securityKeys.allModules(),
    queryFn: () => fetchAllSecurityPages((params) => listModules(params)),
    enabled,
    retry: securityRetry,
  });
}

export function useSecurityModule(moduleId: number) {
  return useQuery({
    queryKey: securityKeys.module(moduleId),
    queryFn: () => getModule(moduleId),
    enabled: isValidId(moduleId),
    retry: securityRetry,
  });
}

export function useSecurityModulePermissions(
  moduleId: number,
  params: SecurityPageParams,
  firstPage?: SecurityPage<SecurityPermissionSummary>,
) {
  return useQuery({
    queryKey: securityKeys.modulePermissions(moduleId, params),
    queryFn: () => listModulePermissions(moduleId, params),
    initialData: embeddedFirstPage(params, firstPage),
    enabled: isValidId(moduleId),
    placeholderData: keepPreviousData,
    retry: securityRetry,
  });
}

export function useAllSecurityModulePermissions(moduleId: number, enabled: boolean) {
  return useQuery({
    queryKey: securityKeys.modulePermissions(moduleId, "all"),
    queryFn: () => fetchAllSecurityPages((params) => listModulePermissions(moduleId, params)),
    enabled: enabled && isValidId(moduleId),
    retry: securityRetry,
  });
}

export function useCreateSecurityModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecurityModuleRequest) => createModule(request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [securityKeys.modules(), securityKeys.dashboard()]);
    },
  });
}

export function useUpdateSecurityModule(moduleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SecurityModuleRequest) => updateModule(moduleId, request),
    onSuccess: async () => {
      await invalidateKeys(queryClient, [
        securityKeys.modules(),
        // Permission rows and role detail embed module code/name.
        securityKeys.permissions(),
        securityKeys.roles(),
        securityKeys.dashboard(),
        securityKeys.access(),
      ]);
    },
  });
}

export function useSetSecurityModulePermissions(moduleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionIds: number[]) => setModulePermissions(moduleId, permissionIds),
    onSuccess: async () => {
      // Membership moves permissions between modules, so every module's
      // count and every permission's module columns can change.
      await invalidateKeys(queryClient, [
        securityKeys.modules(),
        securityKeys.permissions(),
        securityKeys.roles(),
        securityKeys.userDetails(),
        securityKeys.access(),
      ]);
    },
  });
}
