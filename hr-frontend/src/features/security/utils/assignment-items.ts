import type { TFunction } from "i18next";

import type {
  SecurityPermissionSummary,
  SecurityRoleSummary,
  SecurityUserSummary,
} from "@/features/security/api/security-types";
import type { TransferItem } from "@/features/security/components/dual-panel-transfer";
import {
  canActorManageRole,
  getTargetAssignmentBlock,
  type SecurityCapabilities,
} from "@/features/security/utils/security-access";

/** IAM status code ACTIVE; any other status (e.g. INACTIVE) is not active. */
export function isUserActive(user: Pick<SecurityUserSummary, "status">): boolean {
  return user.status === "ACTIVE";
}

export function userLabel(user: SecurityUserSummary): string {
  return user.displayName || user.username;
}

export function roleItem(
  role: SecurityRoleSummary,
  t: TFunction,
  capabilities?: SecurityCapabilities,
): TransferItem {
  const manageable = capabilities ? canActorManageRole(capabilities, role.roleCode) : true;

  return {
    id: role.roleId,
    label: role.roleName,
    description: role.roleCode,
    tag: role.active ? null : t("common.inactive"),
    locked: !manageable,
    lockedReason: manageable ? undefined : t("security.assign.roleNotManageable"),
  };
}

export function permissionItem(permission: SecurityPermissionSummary, t: TFunction): TransferItem {
  return {
    id: permission.permissionId,
    label: permission.permissionName,
    description: [permission.permissionCode, permission.applicationCode].filter(Boolean).join(" · "),
    tag: permission.active ? null : t("common.inactive"),
  };
}

export function userItem(
  user: SecurityUserSummary,
  t: TFunction,
  capabilities?: SecurityCapabilities,
): TransferItem {
  const block = capabilities ? getTargetAssignmentBlock(capabilities, user) : null;

  return {
    id: user.userId,
    label: userLabel(user),
    description: [user.username, user.employeeNumber].filter(Boolean).join(" · "),
    tag: isUserActive(user) ? null : t("common.inactive"),
    locked: block != null,
    lockedReason: block ? t(`security.assign.block.${block}`) : undefined,
  };
}

/**
 * Candidates plus any currently-assigned ids missing from the candidate list
 * (e.g. filtered out), so the editor never silently drops an assignment.
 */
export function withAssigned<T>(
  candidates: T[],
  assigned: T[],
  idOf: (item: T) => number,
): T[] {
  const known = new Set(candidates.map(idOf));
  return [...candidates, ...assigned.filter((item) => !known.has(idOf(item)))];
}
