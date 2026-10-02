import type {
  SecurityModulesParams,
  SecurityPageParams,
  SecurityPermissionsParams,
  SecurityRolesParams,
  SecurityUsersParams,
} from "@/features/security/api/security-types";

// Hierarchical, feature-scoped keys. Invalidating a prefix (for example
// securityKeys.user(id)) also invalidates everything nested under it
// (that user's roles, permissions, sessions and activity).
const ROOT = "security";

export const securityKeys = {
  all: [ROOT] as const,
  access: () => [ROOT, "access"] as const,
  dashboard: () => [ROOT, "dashboard"] as const,

  users: () => [ROOT, "users"] as const,
  userLists: () => [ROOT, "users", "list"] as const,
  userList: (params: SecurityUsersParams) => [ROOT, "users", "list", params] as const,
  allUsers: () => [ROOT, "users", "all"] as const,
  userDetails: () => [ROOT, "users", "detail"] as const,
  user: (userId: number) => [ROOT, "users", "detail", userId] as const,
  userRoles: (userId: number, params?: SecurityPageParams | "all") =>
    [ROOT, "users", "detail", userId, "roles", ...(params ? [params] : [])] as const,
  userPermissions: (userId: number, params?: SecurityPageParams) =>
    [ROOT, "users", "detail", userId, "permissions", ...(params ? [params] : [])] as const,
  userSessions: (userId: number, params?: SecurityPageParams) =>
    [ROOT, "users", "detail", userId, "sessions", ...(params ? [params] : [])] as const,
  userActivity: (userId: number, params?: SecurityPageParams) =>
    [ROOT, "users", "detail", userId, "activity", ...(params ? [params] : [])] as const,

  roles: () => [ROOT, "roles"] as const,
  roleList: (params: SecurityRolesParams) => [ROOT, "roles", "list", params] as const,
  allRoles: () => [ROOT, "roles", "all"] as const,
  role: (roleId: number) => [ROOT, "roles", "detail", roleId] as const,
  roleUsers: (roleId: number, params?: SecurityPageParams | "all") =>
    [ROOT, "roles", "detail", roleId, "users", ...(params ? [params] : [])] as const,
  rolePermissions: (roleId: number, params?: SecurityPageParams | "all") =>
    [ROOT, "roles", "detail", roleId, "permissions", ...(params ? [params] : [])] as const,

  permissions: () => [ROOT, "permissions"] as const,
  permissionList: (params: SecurityPermissionsParams) =>
    [ROOT, "permissions", "list", params] as const,
  allPermissions: () => [ROOT, "permissions", "all"] as const,
  permission: (permissionId: number) => [ROOT, "permissions", "detail", permissionId] as const,
  permissionRoles: (permissionId: number, params?: SecurityPageParams | "all") =>
    [ROOT, "permissions", "detail", permissionId, "roles", ...(params ? [params] : [])] as const,

  modules: () => [ROOT, "modules"] as const,
  moduleList: (params: SecurityModulesParams) => [ROOT, "modules", "list", params] as const,
  allModules: () => [ROOT, "modules", "all"] as const,
  module: (moduleId: number) => [ROOT, "modules", "detail", moduleId] as const,
  modulePermissions: (moduleId: number, params?: SecurityPageParams | "all") =>
    [ROOT, "modules", "detail", moduleId, "permissions", ...(params ? [params] : [])] as const,

  auditLogs: (params?: SecurityPageParams) =>
    [ROOT, "audit-logs", ...(params ? [params] : [])] as const,
};
