import type { SecurityAccess, SecurityUserSummary } from "@/features/security/api/security-types";

// UX-only capability helpers derived from GET /api/security/me/access.
// The backend remains authoritative for every Security operation; these only
// decide which actions are shown or enabled. Role codes are raw backend codes
// (SYSTEM_ADMIN, HR_ADMIN, HR_VIEWER, ...).

export const SYSTEM_ADMIN = "SYSTEM_ADMIN";
export const HR_ADMIN = "HR_ADMIN";

/** Built-in roles that HR_ADMIN can never grant or remove. */
export const PROTECTED_ROLE_CODES: readonly string[] = [SYSTEM_ADMIN, HR_ADMIN];

export function isProtectedRole(roleCode: string | null | undefined): boolean {
  return roleCode != null && PROTECTED_ROLE_CODES.includes(roleCode);
}

export type SecurityCapabilities = {
  isSystemAdmin: boolean;
  isHrAdmin: boolean;
  /** Can enter the Security area and read users/roles/permissions/modules. */
  canReadSecurity: boolean;
  /** Create/update/activate roles, permissions and application modules. */
  canManageDefinitions: boolean;
  /** Role↔permission, permission↔role and module↔permission membership. */
  canManagePermissionAssignments: boolean;
  /** User↔role assignment (HR_ADMIN within delegation limits). */
  canManageRoleAssignments: boolean;
  /** Enable / disable user accounts. */
  canManageUserStatus: boolean;
  /** Detailed sessions and login activity. */
  canViewSecurityTelemetry: boolean;
  canViewAuditLogs: boolean;
  hasRole: (roleCode: string) => boolean;
  hasPermission: (permissionCode: string) => boolean;
};

export function getSecurityCapabilities(access: SecurityAccess | undefined): SecurityCapabilities {
  const roles = new Set(access?.roles ?? []);
  const permissions = new Set(access?.permissions ?? []);

  const isSystemAdmin = roles.has(SYSTEM_ADMIN);
  const isHrAdmin = roles.has(HR_ADMIN);

  return {
    isSystemAdmin,
    isHrAdmin,
    canReadSecurity: isSystemAdmin || isHrAdmin,
    canManageDefinitions: isSystemAdmin,
    canManagePermissionAssignments: isSystemAdmin,
    canManageRoleAssignments: isSystemAdmin || isHrAdmin,
    canManageUserStatus: isSystemAdmin,
    canViewSecurityTelemetry: isSystemAdmin,
    canViewAuditLogs: isSystemAdmin,
    hasRole: (roleCode) => roles.has(roleCode),
    hasPermission: (permissionCode) => permissions.has(permissionCode),
  };
}

/**
 * Whether the actor may grant/remove this role. HR_ADMIN may only manage
 * non-protected roles that the actor currently holds.
 */
export function canActorManageRole(
  capabilities: SecurityCapabilities,
  roleCode: string | null | undefined,
): boolean {
  if (capabilities.isSystemAdmin) return true;
  if (!capabilities.isHrAdmin || !roleCode) return false;
  return !isProtectedRole(roleCode) && capabilities.hasRole(roleCode);
}

export type RoleAssignmentTarget = Pick<SecurityUserSummary, "employeeId" | "roles">;

export type TargetAssignmentBlock = "notAllowed" | "systemAdminAccount" | "notLinkedToEmployee";

/**
 * Returns why the actor cannot manage this account's roles, or null when it
 * can. HR_ADMIN may only manage accounts linked to a (non-deleted) employee
 * and never a SYSTEM_ADMIN account; the backend checks deletion.
 */
export function getTargetAssignmentBlock(
  capabilities: SecurityCapabilities,
  target: RoleAssignmentTarget,
): TargetAssignmentBlock | null {
  if (capabilities.isSystemAdmin) return null;
  if (!capabilities.isHrAdmin) return "notAllowed";
  if (target.roles.includes(SYSTEM_ADMIN)) return "systemAdminAccount";
  if (target.employeeId == null) return "notLinkedToEmployee";
  return null;
}
