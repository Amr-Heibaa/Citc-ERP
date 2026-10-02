import { customInstance } from "@/lib/api/axios";

import type {
  BulkRolePermissionsRequest,
  BulkUserRolesRequest,
  SecurityAccess,
  SecurityActiveRequest,
  SecurityAuditLog,
  SecurityDashboard,
  SecurityIdsRequest,
  SecurityLoginActivity,
  SecurityModuleDetail,
  SecurityModuleRequest,
  SecurityModuleSummary,
  SecurityModulesParams,
  SecurityPage,
  SecurityPageParams,
  SecurityPermissionDetail,
  SecurityPermissionRequest,
  SecurityPermissionSummary,
  SecurityPermissionsParams,
  SecurityRoleDetail,
  SecurityRoleRequest,
  SecurityRoleSummary,
  SecurityRolesParams,
  SecuritySession,
  SecurityUserDetail,
  SecurityUserSummary,
  SecurityUsersParams,
} from "@/features/security/api/security-types";

// Small typed adapter over the application's existing authenticated Axios
// instance (customInstance carries the bearer token, refresh-on-401 and error
// normalization). The Security API is not part of the Orval source, so this
// mirrors what the generated clients do for the HR controllers.

const BASE = "/api/security";

/** Backend page size limits for Security list endpoints (allowed 1..200). */
export const SECURITY_MAX_PAGE_SIZE = 200;
export const SECURITY_DEFAULT_PAGE_SIZE = 25;

function get<T>(url: string, params?: object) {
  return customInstance<T>({ url: `${BASE}${url}`, method: "GET", params });
}

function send<T>(method: "POST" | "PUT", url: string, data: unknown) {
  return customInstance<T>({
    url: `${BASE}${url}`,
    method,
    data,
    headers: { "Content-Type": "application/json" },
  });
}

function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  ) as Partial<T>;
}

function ids(values: number[]): SecurityIdsRequest {
  return { ids: values };
}

function active(value: boolean): SecurityActiveRequest {
  return { active: value };
}

// ---------------------------------------------------------------------------
// Fetch-all helper for assignment pickers
// ---------------------------------------------------------------------------

/**
 * Walks every page at the backend's maximum size. Assignment editors need the
 * complete candidate and current-assignment sets because the PUT endpoints
 * replace the whole set.
 */
export async function fetchAllSecurityPages<T>(
  fetchPage: (params: SecurityPageParams) => Promise<SecurityPage<T>>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 0;

  while (true) {
    const result = await fetchPage({ page, size: SECURITY_MAX_PAGE_SIZE });
    all.push(...result.content);
    page += 1;
    if (result.content.length === 0 || page >= result.totalPages) break;
  }

  return all;
}

// ---------------------------------------------------------------------------
// Access / dashboard
// ---------------------------------------------------------------------------

export function getMyAccess() {
  return get<SecurityAccess>("/me/access");
}

export function getSecurityDashboard() {
  return get<SecurityDashboard>("/dashboard");
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function listUsers(params: SecurityUsersParams) {
  return get<SecurityPage<SecurityUserSummary>>("/users", cleanParams(params));
}

export function getUser(userId: number) {
  return get<SecurityUserDetail>(`/users/${userId}`);
}

export function listUserRoles(userId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityRoleSummary>>(`/users/${userId}/roles`, cleanParams(params));
}

export function listUserPermissions(userId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityPermissionSummary>>(
    `/users/${userId}/permissions`,
    cleanParams(params),
  );
}

export function listUserSessions(userId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecuritySession>>(`/users/${userId}/sessions`, cleanParams(params));
}

export function listUserActivity(userId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityLoginActivity>>(`/users/${userId}/activity`, cleanParams(params));
}

export function setUserActive(userId: number, value: boolean) {
  return send<unknown>("PUT", `/users/${userId}/active`, active(value));
}

export function setUserRoles(userId: number, roleIds: number[]) {
  return send<unknown>("PUT", `/users/${userId}/roles`, ids(roleIds));
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export function listRoles(params: SecurityRolesParams) {
  return get<SecurityPage<SecurityRoleSummary>>("/roles", cleanParams(params));
}

export function getRole(roleId: number) {
  return get<SecurityRoleDetail>(`/roles/${roleId}`);
}

export function createRole(request: SecurityRoleRequest) {
  return send<SecurityRoleSummary>("POST", "/roles", request);
}

export function updateRole(roleId: number, request: SecurityRoleRequest) {
  return send<SecurityRoleSummary>("PUT", `/roles/${roleId}`, request);
}

export function setRoleActive(roleId: number, value: boolean) {
  return send<unknown>("PUT", `/roles/${roleId}/active`, active(value));
}

export function listRoleUsers(roleId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityUserSummary>>(`/roles/${roleId}/users`, cleanParams(params));
}

export function setRoleUsers(roleId: number, userIds: number[]) {
  return send<unknown>("PUT", `/roles/${roleId}/users`, ids(userIds));
}

export function listRolePermissions(roleId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityPermissionSummary>>(
    `/roles/${roleId}/permissions`,
    cleanParams(params),
  );
}

export function setRolePermissions(roleId: number, permissionIds: number[]) {
  return send<unknown>("PUT", `/roles/${roleId}/permissions`, ids(permissionIds));
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export function listPermissions(params: SecurityPermissionsParams) {
  return get<SecurityPage<SecurityPermissionSummary>>("/permissions", cleanParams(params));
}

export function getPermission(permissionId: number) {
  return get<SecurityPermissionDetail>(`/permissions/${permissionId}`);
}

export function createPermission(request: SecurityPermissionRequest) {
  return send<SecurityPermissionSummary>("POST", "/permissions", request);
}

export function updatePermission(permissionId: number, request: SecurityPermissionRequest) {
  return send<SecurityPermissionSummary>("PUT", `/permissions/${permissionId}`, request);
}

export function listPermissionRoles(permissionId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityRoleSummary>>(
    `/permissions/${permissionId}/roles`,
    cleanParams(params),
  );
}

export function setPermissionRoles(permissionId: number, roleIds: number[]) {
  return send<unknown>("PUT", `/permissions/${permissionId}/roles`, ids(roleIds));
}

// ---------------------------------------------------------------------------
// Application modules
// ---------------------------------------------------------------------------

export function listModules(params: SecurityModulesParams) {
  return get<SecurityPage<SecurityModuleSummary>>("/modules", cleanParams(params));
}

export function getModule(moduleId: number) {
  return get<SecurityModuleDetail>(`/modules/${moduleId}`);
}

export function createModule(request: SecurityModuleRequest) {
  return send<SecurityModuleSummary>("POST", "/modules", request);
}

export function updateModule(moduleId: number, request: SecurityModuleRequest) {
  return send<SecurityModuleSummary>("PUT", `/modules/${moduleId}`, request);
}

export function listModulePermissions(moduleId: number, params: SecurityPageParams) {
  return get<SecurityPage<SecurityPermissionSummary>>(
    `/modules/${moduleId}/permissions`,
    cleanParams(params),
  );
}

export function setModulePermissions(moduleId: number, permissionIds: number[]) {
  return send<unknown>("PUT", `/modules/${moduleId}/permissions`, ids(permissionIds));
}

// ---------------------------------------------------------------------------
// Bulk assignments
// ---------------------------------------------------------------------------

export function bulkAssignUserRoles(request: BulkUserRolesRequest) {
  return send<unknown>("POST", "/assignments/user-roles/bulk", request);
}

export function bulkAssignRolePermissions(request: BulkRolePermissionsRequest) {
  return send<unknown>("POST", "/assignments/role-permissions/bulk", request);
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

/** Returns 501 until audit persistence is enabled (security.audit.enabled=true). */
export function listAuditLogs(params: SecurityPageParams) {
  return get<SecurityPage<SecurityAuditLog>>("/audit-logs", cleanParams(params));
}
