import { useTranslation } from "react-i18next";

import type { SecurityPermissionSummary } from "@/features/security/api/security-types";
import {
  useAllSecurityPermissionRoles,
  useSetSecurityPermissionRoles,
} from "@/features/security/api/use-security-permissions";
import { useAllSecurityRoles } from "@/features/security/api/use-security-roles";
import { AssignmentDialog } from "@/features/security/components/assignment-dialog";
import { roleItem, withAssigned } from "@/features/security/utils/assignment-items";

/** SYSTEM_ADMIN only — PUT /permissions/{permissionId}/roles. */
export function PermissionRolesDialog({
  permission,
  open,
  onOpenChange,
}: {
  permission: SecurityPermissionSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const candidates = useAllSecurityRoles(open);
  const current = useAllSecurityPermissionRoles(permission.permissionId, open);
  const setRoles = useSetSecurityPermissionRoles(permission.permissionId);

  const all = withAssigned(candidates.data ?? [], current.data ?? [], (role) => role.roleId);

  return (
    <AssignmentDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("security.permissions.manageRoles")}
      description={t("security.permissions.manageRolesDescription", {
        code: permission.permissionCode,
      })}
      isLoading={candidates.isLoading || current.isLoading}
      error={candidates.error ?? current.error}
      onRetry={() => {
        void candidates.refetch();
        void current.refetch();
      }}
      items={all.map((role) => roleItem(role, t))}
      initialIds={current.data?.map((role) => role.roleId)}
      availableLabel={t("security.assign.availableRoles")}
      assignedLabel={t("security.assign.assignedRoles")}
      searchPlaceholder={t("security.assign.searchRoles")}
      onSave={(ids) => setRoles.mutateAsync(ids)}
      saveLabel={t("security.assign.saveRoles")}
      successMessage={t("security.assign.saved")}
      errorFallbackKey="security.assign.saveError"
    />
  );
}
