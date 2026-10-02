import { Pencil, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoRow } from "@/features/hr/shared/components/info-row";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type {
  SecurityPermissionDetail,
  SecurityPermissionSummary,
} from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import {
  useSecurityPermission,
  useSecurityPermissionRoles,
} from "@/features/security/api/use-security-permissions";
import { PermissionFormDialog } from "@/features/security/components/forms/permission-form-dialog";
import { PermissionRolesDialog } from "@/features/security/components/permissions/permission-roles-dialog";
import { RolesRelationTable } from "@/features/security/components/relation-tables";
import { SecurityCard } from "@/features/security/components/security-card";
import { HeroStatusBadge, HeroTag, SecurityHero } from "@/features/security/components/security-hero";
import { DetailErrorState, PageSkeleton } from "@/features/security/components/security-states";
import { SECURITY_TAB_TRIGGER_CLASS } from "@/features/security/components/tab-styles";
import { formatDateTime } from "@/features/security/utils/format";

function PermissionOverviewTab({
  permission,
  assignedRoles,
}: {
  permission: SecurityPermissionSummary;
  assignedRoles: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SecurityCard title={t("security.permissions.detail.information")}>
        <div className="flex flex-col gap-2">
          <InfoRow label={t("security.fields.code")} value={permission.permissionCode} />
          <InfoRow label={t("security.fields.name")} value={permission.permissionName} />
          <InfoRow label={t("security.fields.description")} value={permission.description} />
          <InfoRow
            label={t("security.fields.status")}
            value={<StatusBadge active={permission.active} />}
          />
          <InfoRow label={t("security.fields.createdAt")} value={formatDateTime(permission.createdAt)} />
        </div>
      </SecurityCard>

      <SecurityCard title={t("security.permissions.detail.related")}>
        <div className="flex flex-col gap-2">
          <InfoRow
            label={t("security.fields.module")}
            value={
              permission.applicationModuleId != null ? (
                <Link
                  to={`/security/modules/${permission.applicationModuleId}`}
                  className="hover:text-[#f5841f]"
                >
                  {permission.applicationName ?? permission.applicationCode}
                </Link>
              ) : (
                t("security.permissions.noModule")
              )
            }
          />
          <InfoRow label={t("security.permissions.detail.assignedRoles")} value={assignedRoles} />
        </div>
      </SecurityCard>
    </div>
  );
}

function PermissionRolesTab({
  permissionId,
  firstPage,
  action,
}: {
  permissionId: number;
  firstPage: SecurityPermissionDetail["roles"];
  action?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const roles = useSecurityPermissionRoles(
    permissionId,
    { page, size: SECURITY_DEFAULT_PAGE_SIZE },
    firstPage,
  );

  return (
    <SecurityCard
      flush
      title={t("security.permissions.detail.rolesCount", {
        count: roles.data?.totalElements ?? 0,
      })}
      action={action}
    >
      <RolesRelationTable
        query={roles}
        onPageChange={setPage}
        emptyTitle={t("security.permissions.detail.noRoles")}
        caption={t("security.permissions.detail.rolesTab")}
      />
    </SecurityCard>
  );
}

export function SecurityPermissionDetailPage() {
  const { t } = useTranslation();
  const permissionId = Number(useParams().permissionId);
  const { capabilities } = useSecurityAccess();
  const detail = useSecurityPermission(permissionId);

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);

  if (detail.isLoading) return <PageSkeleton />;

  if (detail.isError || !detail.data?.permission) {
    return (
      <DetailErrorState
        error={detail.error}
        backTo="/security/permissions"
        backLabel={t("security.permissions.backToList")}
        onRetry={() => detail.refetch()}
      />
    );
  }

  const { permission } = detail.data;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityHero
        square
        title={permission.permissionName}
        badgeText={permission.permissionName}
        subtitle={<span className="font-mono">{permission.permissionCode}</span>}
        badges={
          <>
            <HeroStatusBadge
              active={permission.active}
              label={permission.active ? t("common.active") : t("common.inactive")}
            />
            {permission.applicationName && <HeroTag>{permission.applicationName}</HeroTag>}
          </>
        }
        actions={
          capabilities.canManageDefinitions && (
            <Button
              size="sm"
              className="bg-[#f5841f] text-white hover:bg-[#e07413]"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              {t("security.permissions.edit")}
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="h-10 w-full justify-start overflow-x-auto rounded-none border-b border-gray-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.permissions.detail.overviewTab")}
          </TabsTrigger>
          <TabsTrigger value="roles" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.permissions.detail.rolesTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PermissionOverviewTab
            permission={permission}
            assignedRoles={detail.data.roles.totalElements}
          />
        </TabsContent>
        <TabsContent value="roles">
          <PermissionRolesTab
            permissionId={permissionId}
            firstPage={detail.data.roles}
            action={
              capabilities.canManagePermissionAssignments && (
                <Button size="sm" variant="outline" onClick={() => setRolesOpen(true)}>
                  <ShieldCheck className="size-4" />
                  {t("security.permissions.manageRoles")}
                </Button>
              )
            }
          />
        </TabsContent>
      </Tabs>

      {capabilities.canManageDefinitions && (
        <PermissionFormDialog open={editOpen} onOpenChange={setEditOpen} permission={permission} />
      )}
      {capabilities.canManagePermissionAssignments && (
        <PermissionRolesDialog permission={permission} open={rolesOpen} onOpenChange={setRolesOpen} />
      )}
    </div>
  );
}
