// Types for the Security/RBAC API behind the gateway at /api/security/**.
//
// The Security endpoints are not part of the Orval OpenAPI source
// (orval.config.ts points at the HR service), so these types mirror the
// backend DTOs from the Security API contract (ems-backend
// docs/security-api.md) by hand. Keep them in sync with that contract.

/** Backend page envelope used by every Security list and nested collection. */
export type SecurityPage<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type SecurityPageParams = {
  page?: number;
  size?: number;
};

/** GET /me/access — role/permission/module codes are raw (e.g. SYSTEM_ADMIN). */
export type SecurityAccess = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  modules: string[];
};

export type SecurityDashboard = {
  activeUsers: number;
  activeRoles: number;
  activePermissions: number;
  activeModules: number;
};

/** IAM account status codes used by the users status filter. */
export type SecurityUserStatus = "ACTIVE" | "INACTIVE";

export type SecurityUserSummary = {
  userId: number;
  username: string;
  email: string | null;
  /** IAM status code, e.g. ACTIVE / INACTIVE. */
  status: string;
  createdAt: string;
  updatedAt: string | null;
  employeeId: number | null;
  employeeNumber: string | null;
  displayName: string | null;
  /** Raw role codes. */
  roles: string[];
  lastAccess: string | null;
};

export type SecurityLoginStatistics = {
  attempts: number;
  successfulAttempts: number;
  failedAttempts: number;
};

/** GET /users/{userId} — includes the first page of roles and effective permissions. */
export type SecurityUserDetail = {
  account: SecurityUserSummary;
  roles: SecurityPage<SecurityRoleSummary>;
  effectivePermissions: SecurityPage<SecurityPermissionSummary>;
  loginStatistics: SecurityLoginStatistics;
};

export type SecurityUsersParams = SecurityPageParams & {
  search?: string;
  status?: SecurityUserStatus;
  roleId?: number;
};

export type SecuritySession = {
  sessionId: number;
  sessionUuid: string;
  clientApplicationId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  startedAt: string | null;
  lastSeenAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
};

/** One row of existing login_attempt data — not a complete activity history. */
export type SecurityLoginActivity = {
  loginAttemptId: number;
  success: boolean;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  clientApplicationId: number | null;
};

/** Audit row shape is not pinned by the contract; rendered from returned scalar fields. */
export type SecurityAuditLog = Record<string, unknown>;

export type SecurityRoleSummary = {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  userCount: number;
  permissionCount: number;
};

/** GET /roles/{roleId} — modules are the distinct modules the role represents. */
export type SecurityRoleDetail = {
  role: SecurityRoleSummary;
  modules: SecurityModuleSummary[];
  permissions: SecurityPage<SecurityPermissionSummary>;
  users: SecurityPage<SecurityUserSummary>;
};

export type SecurityRolesParams = SecurityPageParams & {
  search?: string;
  active?: boolean;
};

export type SecurityRoleRequest = {
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
};

export type SecurityPermissionSummary = {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  applicationModuleId: number | null;
  applicationCode: string | null;
  applicationName: string | null;
};

export type SecurityPermissionDetail = {
  permission: SecurityPermissionSummary;
  roles: SecurityPage<SecurityRoleSummary>;
};

export type SecurityPermissionsParams = SecurityPageParams & {
  search?: string;
  active?: boolean;
  moduleId?: number;
};

export type SecurityPermissionRequest = {
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  applicationModuleId?: number | null;
};

export type SecurityModuleSummary = {
  applicationModuleId: number;
  applicationCode: string;
  applicationName: string;
  description: string | null;
  active: boolean;
  permissionCount: number;
};

export type SecurityModuleDetail = {
  module: SecurityModuleSummary;
  permissions: SecurityPage<SecurityPermissionSummary>;
};

export type SecurityModulesParams = SecurityPageParams & {
  search?: string;
  active?: boolean;
};

export type SecurityModuleRequest = {
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
};

/** Single-parent replace-style assignment (max 500 ids, no schedule dates). */
export type SecurityIdsRequest = {
  ids: number[];
};

export type SecurityActiveRequest = {
  active: boolean;
};

export type BulkUserRolesRequest = {
  userIds: number[];
  roleIds: number[];
  replaceExisting: boolean;
};

export type BulkRolePermissionsRequest = {
  roleIds: number[];
  permissionIds: number[];
  replaceExisting: boolean;
};
