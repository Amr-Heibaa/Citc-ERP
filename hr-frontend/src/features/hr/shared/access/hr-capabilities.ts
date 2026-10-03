import type { SecurityAccess } from "@/features/security/api/security-types";
import type { HrAccessMeResponse } from "@/lib/api/generated/model";

// Central HR authorization resolver. Combines:
//   A) IAM effective access from GET /api/security/me/access
//      (roles / permissions — never role *names* like HR_EMPLOYEE_VIEWER), and
//   B) the legacy HR access/delegation model from GET /api/hr/access/me.
// UX only: the backend remains authoritative for every request.

export const HR_EMPLOYEE_PERMISSIONS = {
  view: "HR_EMPLOYEE_VIEW",
  create: "HR_EMPLOYEE_CREATE",
  edit: "HR_EMPLOYEE_EDIT",
  delete: "HR_EMPLOYEE_DELETE",
} as const;

const SYSTEM_ADMIN = "SYSTEM_ADMIN";
const HR_ADMIN = "HR_ADMIN";

export type HrCapabilities = {
  isSystemAdmin: boolean;
  isHrAdmin: boolean;

  hasEmployeeView: boolean;
  hasEmployeeCreate: boolean;
  hasEmployeeEdit: boolean;
  hasEmployeeDelete: boolean;

  legacyCanViewHr: boolean;
  legacyCanEditHr: boolean;
  legacyCanManageDelegation: boolean;

  /** HR module (sidebar entry + /hr home) is reachable. */
  canEnterHr: boolean;
  canViewEmployees: boolean;
  canCreateEmployee: boolean;
  canEditEmployee: boolean;
  canDeleteEmployee: boolean;

  /**
   * Every HR area that is not permissionized yet (organizations, jobs,
   * employment, contracts, settings, reports, import, deleted/restore,
   * export, account administration). Same rule the app used before IAM
   * permissions existed: HR admin overrides or legacy canViewHr.
   */
  canViewBroadHr: boolean;
  canEditBroadHr: boolean;
  canManageHrDelegation: boolean;
};

export function resolveHrCapabilities(
  security: Pick<SecurityAccess, "roles" | "permissions"> | undefined,
  legacy: HrAccessMeResponse | undefined,
): HrCapabilities {
  const roles = new Set(security?.roles ?? []);
  const permissions = new Set(security?.permissions ?? []);

  const isSystemAdmin = roles.has(SYSTEM_ADMIN);
  const isHrAdmin = roles.has(HR_ADMIN);
  const adminOverride = isSystemAdmin || isHrAdmin;

  const hasEmployeeView = permissions.has(HR_EMPLOYEE_PERMISSIONS.view);
  const hasEmployeeCreate = permissions.has(HR_EMPLOYEE_PERMISSIONS.create);
  const hasEmployeeEdit = permissions.has(HR_EMPLOYEE_PERMISSIONS.edit);
  const hasEmployeeDelete = permissions.has(HR_EMPLOYEE_PERMISSIONS.delete);

  const legacyCanViewHr = legacy?.canViewHr ?? false;
  const legacyCanEditHr = legacy?.canEditHr ?? false;
  const legacyCanManageDelegation = legacy?.canManageDelegation ?? false;

  // Legacy canViewHr keeps exactly the behaviour delegated users had before.
  const canViewBroadHr = adminOverride || legacyCanViewHr;
  const canEditBroadHr = adminOverride || legacyCanEditHr;

  // Mutations are never assumed to imply VIEW: edit/delete happen from the
  // employee detail page, so they require VIEW as well.
  const canViewEmployees = canViewBroadHr || hasEmployeeView;
  const canCreateEmployee = canViewBroadHr || hasEmployeeCreate;
  const canEditEmployee = canViewBroadHr || (hasEmployeeView && hasEmployeeEdit);
  const canDeleteEmployee = canViewBroadHr || (hasEmployeeView && hasEmployeeDelete);

  return {
    isSystemAdmin,
    isHrAdmin,
    hasEmployeeView,
    hasEmployeeCreate,
    hasEmployeeEdit,
    hasEmployeeDelete,
    legacyCanViewHr,
    legacyCanEditHr,
    legacyCanManageDelegation,
    canEnterHr: canViewBroadHr || canViewEmployees || canCreateEmployee,
    canViewEmployees,
    canCreateEmployee,
    canEditEmployee,
    canDeleteEmployee,
    canViewBroadHr,
    canEditBroadHr,
    canManageHrDelegation: legacyCanManageDelegation,
  };
}
