import { Power, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useSecurityUser, useSetUserActive } from "@/features/security/api/use-security-users";
import { ConfirmActionDialog } from "@/features/security/components/confirm-action-dialog";
import { HeroStatusBadge, HeroTag, SecurityHero } from "@/features/security/components/security-hero";
import { DetailErrorState, PageSkeleton } from "@/features/security/components/security-states";
import { SECURITY_TAB_TRIGGER_CLASS } from "@/features/security/components/tab-styles";
import { UserOverviewTab } from "@/features/security/components/users/user-overview-tab";
import {
  UserActivityTab,
  UserPermissionsTab,
  UserRolesTab,
  UserSessionsTab,
} from "@/features/security/components/users/user-relation-tabs";
import { isUserActive, userLabel } from "@/features/security/utils/assignment-items";
import { getTargetAssignmentBlock } from "@/features/security/utils/security-access";

export function SecurityUserDetailPage() {
  const { t } = useTranslation();
  const userId = Number(useParams().userId);
  const { capabilities } = useSecurityAccess();
  const user = useSecurityUser(userId);
  const setActive = useSetUserActive(userId);
  const [tab, setTab] = useState("overview");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (user.isLoading) return <PageSkeleton />;

  if (user.isError || !user.data) {
    return (
      <DetailErrorState
        error={user.error}
        backTo="/security/users"
        backLabel={t("security.users.backToList")}
        onRetry={() => user.refetch()}
      />
    );
  }

  const { account } = user.data;
  const active = isUserActive(account);
  const block = getTargetAssignmentBlock(capabilities, account);
  const canManageRoles = capabilities.canManageRoleAssignments && block == null;

  const manageRolesLink = canManageRoles ? (
    <Button asChild size="sm" className="bg-[#f5841f] text-white hover:bg-[#e07413]">
      <Link to={`/security/users/${userId}/assign-roles`}>
        <ShieldCheck className="size-4" />
        {t("security.users.manageRoles")}
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityHero
        title={userLabel(account)}
        badgeText={userLabel(account)}
        subtitle={[account.username, account.email, account.employeeNumber].filter(Boolean).join(" · ")}
        badges={
          <>
            <HeroStatusBadge
              active={active}
              label={active ? t("common.active") : t("common.inactive")}
            />
            {account.roles.slice(0, 3).map((roleCode) => (
              <HeroTag key={roleCode}>{roleCode}</HeroTag>
            ))}
          </>
        }
        actions={
          capabilities.canManageUserStatus && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setConfirmOpen(true)}
            >
              <Power className="size-4" />
              {active ? t("security.users.disable") : t("security.users.enable")}
            </Button>
          )
        }
      />

      {capabilities.canManageRoleAssignments && block && (
        <p
          role="note"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-['Inter',sans-serif] text-sm text-gray-500"
        >
          {t(`security.assign.block.${block}`)}
        </p>
      )}

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <div className="flex flex-col gap-2 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 w-auto justify-start overflow-x-auto rounded-none bg-transparent p-0">
            <TabsTrigger value="overview" className={SECURITY_TAB_TRIGGER_CLASS}>
              {t("security.users.detail.overviewTab")}
            </TabsTrigger>
            <TabsTrigger value="roles" className={SECURITY_TAB_TRIGGER_CLASS}>
              {t("security.users.detail.rolesTab")}
            </TabsTrigger>
            <TabsTrigger value="permissions" className={SECURITY_TAB_TRIGGER_CLASS}>
              {t("security.users.detail.permissionsTab")}
            </TabsTrigger>
            {capabilities.canViewSecurityTelemetry && (
              <>
                <TabsTrigger value="activity" className={SECURITY_TAB_TRIGGER_CLASS}>
                  {t("security.users.detail.activityTab")}
                </TabsTrigger>
                <TabsTrigger value="sessions" className={SECURITY_TAB_TRIGGER_CLASS}>
                  {t("security.users.detail.sessionsTab")}
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {manageRolesLink && <div className="pb-2 sm:pb-0">{manageRolesLink}</div>}
        </div>

        <TabsContent value="overview">
          <UserOverviewTab detail={user.data} />
        </TabsContent>
        <TabsContent value="roles">
          <UserRolesTab userId={userId} firstPage={user.data.roles} />
        </TabsContent>
        <TabsContent value="permissions">
          <UserPermissionsTab userId={userId} firstPage={user.data.effectivePermissions} />
        </TabsContent>
        {capabilities.canViewSecurityTelemetry && (
          <>
            <TabsContent value="activity">
              <UserActivityTab userId={userId} />
            </TabsContent>
            <TabsContent value="sessions">
              <UserSessionsTab userId={userId} />
            </TabsContent>
          </>
        )}
      </Tabs>

      {capabilities.canManageUserStatus && (
        <ConfirmActionDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={active ? t("security.users.disableTitle") : t("security.users.enableTitle")}
          description={
            active
              ? t("security.users.disableDescription", { name: account.username })
              : t("security.users.enableDescription", { name: account.username })
          }
          confirmLabel={active ? t("security.users.disable") : t("security.users.enable")}
          destructive={active}
          onConfirm={() => setActive.mutateAsync(!active)}
          successMessage={active ? t("security.users.disabled") : t("security.users.enabled")}
          errorFallbackKey="security.users.statusError"
        />
      )}
    </div>
  );
}
