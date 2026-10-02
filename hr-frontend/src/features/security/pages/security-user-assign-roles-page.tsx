import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useAllSecurityRoles } from "@/features/security/api/use-security-roles";
import {
  useAllSecurityUserRoles,
  useSecurityUser,
  useSetUserRoles,
} from "@/features/security/api/use-security-users";
import { AssignmentEditor, WarningNote } from "@/features/security/components/assignment-editor";
import { SecurityCard } from "@/features/security/components/security-card";
import { HeroStatusBadge, SecurityHero } from "@/features/security/components/security-hero";
import { SecurityPageHeader } from "@/features/security/components/security-page-header";
import {
  AccessDeniedState,
  DetailErrorState,
  ErrorState,
  PageSkeleton,
  PanelSkeleton,
} from "@/features/security/components/security-states";
import {
  isUserActive,
  roleItem,
  userLabel,
  withAssigned,
} from "@/features/security/utils/assignment-items";
import { getTargetAssignmentBlock } from "@/features/security/utils/security-access";

/**
 * Figma "Assign Roles to User". PUT /users/{userId}/roles with the complete
 * role id set. No start/end dates: the backend does not support scheduled
 * assignments.
 */
export function SecurityUserAssignRolesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = Number(useParams().userId);
  const { capabilities } = useSecurityAccess();

  const user = useSecurityUser(userId);
  const account = user.data?.account;
  const block = account ? getTargetAssignmentBlock(capabilities, account) : null;
  const allowed = capabilities.canManageRoleAssignments && block == null;

  const roles = useAllSecurityRoles(allowed && account != null);
  const current = useAllSecurityUserRoles(userId);
  const setRoles = useSetUserRoles(userId);

  if (user.isLoading) return <PageSkeleton />;

  if (user.isError || !account) {
    return (
      <DetailErrorState
        error={user.error}
        backTo="/security/users"
        backLabel={t("security.users.backToList")}
        onRetry={() => user.refetch()}
      />
    );
  }

  if (!allowed) {
    return (
      <AccessDeniedState
        description={block ? t(`security.assign.block.${block}`) : undefined}
      />
    );
  }

  const active = isUserActive(account);
  const detailPath = `/security/users/${userId}`;
  const loadError = roles.error ?? current.error;
  const items = withAssigned(roles.data ?? [], current.data ?? [], (role) => role.roleId).map(
    (role) => roleItem(role, t, capabilities),
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityPageHeader
        title={t("security.assign.userRolesTitle")}
        subtitle={t("security.assign.userRolesSubtitle")}
      />

      <SecurityHero
        title={userLabel(account)}
        badgeText={userLabel(account)}
        subtitle={[account.username, account.employeeNumber].filter(Boolean).join(" · ")}
        badges={
          <HeroStatusBadge active={active} label={active ? t("common.active") : t("common.inactive")} />
        }
      />

      {capabilities.isHrAdmin && !capabilities.isSystemAdmin && (
        <WarningNote>{t("security.assign.hrAdminRolesNote")}</WarningNote>
      )}

      <SecurityCard>
        {loadError ? (
          <ErrorState
            error={loadError}
            onRetry={() => {
              void roles.refetch();
              void current.refetch();
            }}
          />
        ) : roles.isLoading || current.isLoading || !current.data ? (
          <PanelSkeleton rows={6} />
        ) : (
          <AssignmentEditor
            items={items}
            initialIds={current.data.map((role) => role.roleId)}
            availableLabel={t("security.assign.availableRoles")}
            assignedLabel={t("security.assign.assignedRoles")}
            searchPlaceholder={t("security.assign.searchRoles")}
            onSave={(ids) => setRoles.mutateAsync(ids)}
            onCancel={() => navigate(detailPath)}
            onSaved={() => navigate(detailPath)}
            saveLabel={t("security.assign.saveRoles")}
            successMessage={t("security.assign.saved")}
            errorFallbackKey="security.assign.saveError"
          />
        )}
      </SecurityCard>
    </div>
  );
}
