import { useTranslation } from "react-i18next";

import type { SecurityRoleSummary } from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import {
  useAllSecurityRoleUsers,
  useSetSecurityRoleUsers,
} from "@/features/security/api/use-security-roles";
import { useAllSecurityUsers } from "@/features/security/api/use-security-users";
import { WarningNote } from "@/features/security/components/assignment-editor";
import { AssignmentDialog } from "@/features/security/components/assignment-dialog";
import { userItem, withAssigned } from "@/features/security/utils/assignment-items";

/**
 * PUT /roles/{roleId}/users. Callers only open this when the actor may manage
 * the role; for HR_ADMIN, SYSTEM_ADMIN accounts and accounts without a linked
 * employee stay locked in place.
 */
export function RoleUsersDialog({
  role,
  open,
  onOpenChange,
}: {
  role: SecurityRoleSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const candidates = useAllSecurityUsers(open);
  const current = useAllSecurityRoleUsers(role.roleId, open);
  const setUsers = useSetSecurityRoleUsers(role.roleId);

  const all = withAssigned(candidates.data ?? [], current.data ?? [], (user) => user.userId);
  const initialIds = current.data?.map((user) => user.userId);

  return (
    <AssignmentDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("security.roles.manageUsers")}
      description={t("security.roles.manageUsersDescription", { name: role.roleName })}
      warning={
        capabilities.isHrAdmin && !capabilities.isSystemAdmin ? (
          <WarningNote>{t("security.assign.hrAdminUsersNote")}</WarningNote>
        ) : undefined
      }
      isLoading={candidates.isLoading || current.isLoading}
      error={candidates.error ?? current.error}
      onRetry={() => {
        void candidates.refetch();
        void current.refetch();
      }}
      items={all.map((user) => userItem(user, t, capabilities))}
      initialIds={initialIds}
      availableLabel={t("security.assign.availableUsers")}
      assignedLabel={t("security.assign.assignedUsers")}
      searchPlaceholder={t("security.assign.searchUsers")}
      onSave={(ids) =>
        setUsers.mutateAsync({ userIds: ids, previousUserIds: initialIds ?? [] })
      }
      saveLabel={t("security.assign.saveUsers")}
      successMessage={t("security.assign.saved")}
      errorFallbackKey="security.assign.saveError"
    />
  );
}
