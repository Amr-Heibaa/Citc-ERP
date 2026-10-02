import { KeyRound, Pencil, Power, UsersRound } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoRow } from "@/features/hr/shared/components/info-row";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type { SecurityRoleDetail } from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import {
  useSecurityRole,
  useSecurityRolePermissions,
  useSecurityRoleUsers,
  useSetSecurityRoleActive,
} from "@/features/security/api/use-security-roles";
import { ConfirmActionDialog } from "@/features/security/components/confirm-action-dialog";
import { RoleFormDialog } from "@/features/security/components/forms/role-form-dialog";
import {
  PermissionsRelationTable,
  UsersRelationTable,
} from "@/features/security/components/relation-tables";
import { RolePermissionsDialog } from "@/features/security/components/roles/role-permissions-dialog";
import { RoleUsersDialog } from "@/features/security/components/roles/role-users-dialog";
import { SecurityCard } from "@/features/security/components/security-card";
import { HeroStatusBadge, HeroTag, SecurityHero } from "@/features/security/components/security-hero";
import { DetailErrorState, PageSkeleton } from "@/features/security/components/security-states";
import { SECURITY_TAB_TRIGGER_CLASS } from "@/features/security/components/tab-styles";
import { formatDateTime } from "@/features/security/utils/format";
import {
  SYSTEM_ADMIN,
  canActorManageRole,
  isProtectedRole,
} from "@/features/security/utils/security-access";

function RoleOverviewTab({ detail }: { detail: SecurityRoleDetail }) {
  const { t } = useTranslation();
  const { role } = detail;
  const { modules } = detail;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SecurityCard title={t("security.roles.detail.information")}>
        <div className="flex flex-col gap-2">
          <InfoRow label={t("security.fields.status")} value={<StatusBadge active={role.active} />} />
          <InfoRow label={t("security.fields.code")} value={role.roleCode} />
          <InfoRow label={t("security.fields.name")} value={role.roleName} />
          <InfoRow label={t("security.fields.description")} value={role.description} />
          <InfoRow label={t("security.fields.createdAt")} value={formatDateTime(role.createdAt)} />
        </div>
      </SecurityCard>

      <SecurityCard title={t("security.roles.detail.summary")}>
        <div className="flex flex-col gap-2">
          <InfoRow label={t("security.roles.columns.users")} value={role.userCount} />
          <InfoRow label={t("security.roles.columns.permissions")} value={role.permissionCount} />
          <InfoRow label={t("security.roles.detail.modules")} value={modules.length} />
        </div>

        {modules.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={t("security.roles.detail.modules")}>
            {modules.map((module) => (
              <li key={module.applicationModuleId}>
                <Link
                  to={`/security/modules/${module.applicationModuleId}`}
                  className="inline-flex rounded-full bg-[#f4f6f9] px-3 py-1 font-['Inter',sans-serif] text-xs font-medium text-gray-600 hover:bg-[#f5841f]/10 hover:text-[#f5841f]"
                >
                  {module.applicationName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SecurityCard>
    </div>
  );
}

function RolePermissionsTab({
  roleId,
  firstPage,
  action,
}: {
  roleId: number;
  firstPage: SecurityRoleDetail["permissions"];
  action?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const permissions = useSecurityRolePermissions(
    roleId,
    { page, size: SECURITY_DEFAULT_PAGE_SIZE },
    firstPage,
  );

  return (
    <SecurityCard
      flush
      title={t("security.roles.detail.permissionsCount", { count: permissions.data?.totalElements ?? 0 })}
      action={action}
    >
      <PermissionsRelationTable
        query={permissions}
        onPageChange={setPage}
        emptyTitle={t("security.roles.detail.noPermissions")}
        caption={t("security.roles.detail.permissionsTab")}
      />
    </SecurityCard>
  );
}

function RoleUsersTab({
  roleId,
  firstPage,
  action,
}: {
  roleId: number;
  firstPage: SecurityRoleDetail["users"];
  action?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const users = useSecurityRoleUsers(roleId, { page, size: SECURITY_DEFAULT_PAGE_SIZE }, firstPage);

  return (
    <SecurityCard
      flush
      title={t("security.roles.detail.usersCount", { count: users.data?.totalElements ?? 0 })}
      action={action}
    >
      <UsersRelationTable
        query={users}
        onPageChange={setPage}
        emptyTitle={t("security.roles.detail.noUsers")}
        caption={t("security.roles.detail.usersTab")}
      />
    </SecurityCard>
  );
}

export function SecurityRoleDetailPage() {
  const { t } = useTranslation();
  const roleId = Number(useParams().roleId);
  const { capabilities } = useSecurityAccess();
  const detail = useSecurityRole(roleId);
  const setActive = useSetSecurityRoleActive(roleId);

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  if (detail.isLoading) return <PageSkeleton />;

  if (detail.isError || !detail.data?.role) {
    return (
      <DetailErrorState
        error={detail.error}
        backTo="/security/roles"
        backLabel={t("security.roles.backToList")}
        onRetry={() => detail.refetch()}
      />
    );
  }

  const { role } = detail.data;
  const isSystemAdminRole = role.roleCode.toUpperCase() === SYSTEM_ADMIN;
  // Deactivating SYSTEM_ADMIN globally is not a supported operation.
  const canToggleStatus = capabilities.canManageDefinitions && !(isSystemAdminRole && role.active);
  const canManageUsers = canActorManageRole(capabilities, role.roleCode);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityHero
        square
        title={role.roleName}
        badgeText={role.roleName}
        subtitle={<span className="font-mono">{role.roleCode}</span>}
        badges={
          <>
            <HeroStatusBadge
              active={role.active}
              label={role.active ? t("common.active") : t("common.inactive")}
            />
            {isProtectedRole(role.roleCode) && <HeroTag>{t("security.roles.builtIn")}</HeroTag>}
          </>
        }
        actions={
          <>
            {canToggleStatus && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setStatusOpen(true)}
              >
                <Power className="size-4" />
                {role.active ? t("security.common.deactivate") : t("security.common.activate")}
              </Button>
            )}
            {capabilities.canManageDefinitions && (
              <Button
                size="sm"
                className="bg-[#f5841f] text-white hover:bg-[#e07413]"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                {t("security.roles.edit")}
              </Button>
            )}
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="h-10 w-full justify-start overflow-x-auto rounded-none border-b border-gray-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.roles.detail.overviewTab")}
          </TabsTrigger>
          <TabsTrigger value="permissions" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.roles.detail.permissionsTab")}
          </TabsTrigger>
          <TabsTrigger value="users" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.roles.detail.usersTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RoleOverviewTab detail={detail.data} />
        </TabsContent>
        <TabsContent value="permissions">
          <RolePermissionsTab
            roleId={roleId}
            firstPage={detail.data.permissions}
            action={
              capabilities.canManagePermissionAssignments && (
                <Button size="sm" variant="outline" onClick={() => setPermissionsOpen(true)}>
                  <KeyRound className="size-4" />
                  {t("security.roles.managePermissions")}
                </Button>
              )
            }
          />
        </TabsContent>
        <TabsContent value="users">
          <RoleUsersTab
            roleId={roleId}
            firstPage={detail.data.users}
            action={
              canManageUsers && (
                <Button size="sm" variant="outline" onClick={() => setUsersOpen(true)}>
                  <UsersRound className="size-4" />
                  {t("security.roles.manageUsers")}
                </Button>
              )
            }
          />
        </TabsContent>
      </Tabs>

      {capabilities.canManageDefinitions && (
        <>
          <RoleFormDialog open={editOpen} onOpenChange={setEditOpen} role={role} />
          <ConfirmActionDialog
            open={statusOpen}
            onOpenChange={setStatusOpen}
            title={role.active ? t("security.roles.deactivateTitle") : t("security.roles.activateTitle")}
            description={
              role.active
                ? t("security.roles.deactivateDescription", { name: role.roleName })
                : t("security.roles.activateDescription", { name: role.roleName })
            }
            confirmLabel={role.active ? t("security.common.deactivate") : t("security.common.activate")}
            destructive={role.active}
            onConfirm={() => setActive.mutateAsync(!role.active)}
            successMessage={t("security.roles.statusUpdated")}
            errorFallbackKey="security.roles.statusError"
          />
        </>
      )}
      {capabilities.canManagePermissionAssignments && (
        <RolePermissionsDialog role={role} open={permissionsOpen} onOpenChange={setPermissionsOpen} />
      )}
      {canManageUsers && <RoleUsersDialog role={role} open={usersOpen} onOpenChange={setUsersOpen} />}
    </div>
  );
}
