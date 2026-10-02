import { useTranslation } from "react-i18next";

import type { SecurityRoleSummary } from "@/features/security/api/security-types";
import { useAllSecurityPermissions } from "@/features/security/api/use-security-permissions";
import {
  useAllSecurityRolePermissions,
  useSetSecurityRolePermissions,
} from "@/features/security/api/use-security-roles";
import { AssignmentDialog } from "@/features/security/components/assignment-dialog";
import { permissionItem, withAssigned } from "@/features/security/utils/assignment-items";

/** SYSTEM_ADMIN only — PUT /roles/{roleId}/permissions. */
export function RolePermissionsDialog({
  role,
  open,
  onOpenChange,
}: {
  role: SecurityRoleSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const candidates = useAllSecurityPermissions(open);
  const current = useAllSecurityRolePermissions(role.roleId, open);
  const setPermissions = useSetSecurityRolePermissions(role.roleId);

  const all = withAssigned(candidates.data ?? [], current.data ?? [], (p) => p.permissionId);

  return (
    <AssignmentDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("security.roles.managePermissions")}
      description={t("security.roles.managePermissionsDescription", { name: role.roleName })}
      isLoading={candidates.isLoading || current.isLoading}
      error={candidates.error ?? current.error}
      onRetry={() => {
        void candidates.refetch();
        void current.refetch();
      }}
      items={all.map((permission) => permissionItem(permission, t))}
      initialIds={current.data?.map((permission) => permission.permissionId)}
      availableLabel={t("security.assign.availablePermissions")}
      assignedLabel={t("security.assign.assignedPermissions")}
      searchPlaceholder={t("security.assign.searchPermissions")}
      onSave={(ids) => setPermissions.mutateAsync(ids)}
      saveLabel={t("security.assign.savePermissions")}
      successMessage={t("security.assign.saved")}
      errorFallbackKey="security.assign.saveError"
    />
  );
}
