import { KeyRound, Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoRow } from "@/features/hr/shared/components/info-row";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type { SecurityModuleDetail } from "@/features/security/api/security-types";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import {
  useSecurityModule,
  useSecurityModulePermissions,
} from "@/features/security/api/use-security-modules";
import { ModuleFormDialog } from "@/features/security/components/forms/module-form-dialog";
import { ModulePermissionsDialog } from "@/features/security/components/modules/module-permissions-dialog";
import { PermissionsRelationTable } from "@/features/security/components/relation-tables";
import { SecurityCard } from "@/features/security/components/security-card";
import { HeroStatusBadge, SecurityHero } from "@/features/security/components/security-hero";
import { DetailErrorState, PageSkeleton } from "@/features/security/components/security-states";
import { SECURITY_TAB_TRIGGER_CLASS } from "@/features/security/components/tab-styles";

function ModulePermissionsTab({
  moduleId,
  firstPage,
  action,
}: {
  moduleId: number;
  firstPage: SecurityModuleDetail["permissions"];
  action?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const permissions = useSecurityModulePermissions(
    moduleId,
    { page, size: SECURITY_DEFAULT_PAGE_SIZE },
    firstPage,
  );

  return (
    <SecurityCard
      flush
      title={t("security.modules.detail.permissionsCount", {
        count: permissions.data?.totalElements ?? 0,
      })}
      action={action}
    >
      <PermissionsRelationTable
        query={permissions}
        onPageChange={setPage}
        emptyTitle={t("security.modules.detail.noPermissions")}
        caption={t("security.modules.detail.permissionsTab")}
        showModule={false}
      />
    </SecurityCard>
  );
}

export function SecurityModuleDetailPage() {
  const { t } = useTranslation();
  const moduleId = Number(useParams().moduleId);
  const { capabilities } = useSecurityAccess();
  const detail = useSecurityModule(moduleId);

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  if (detail.isLoading) return <PageSkeleton />;

  if (detail.isError || !detail.data?.module) {
    return (
      <DetailErrorState
        error={detail.error}
        backTo="/security/modules"
        backLabel={t("security.modules.backToList")}
        onRetry={() => detail.refetch()}
      />
    );
  }

  const { module } = detail.data;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <SecurityHero
        square
        title={module.applicationName}
        badgeText={module.applicationCode}
        subtitle={module.description ?? <span className="font-mono">{module.applicationCode}</span>}
        badges={
          <HeroStatusBadge
            active={module.active}
            label={module.active ? t("common.active") : t("common.inactive")}
          />
        }
        actions={
          capabilities.canManageDefinitions && (
            <Button
              size="sm"
              className="bg-[#f5841f] text-white hover:bg-[#e07413]"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
              {t("security.modules.edit")}
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="h-10 w-full justify-start overflow-x-auto rounded-none border-b border-gray-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.modules.detail.overviewTab")}
          </TabsTrigger>
          <TabsTrigger value="permissions" className={SECURITY_TAB_TRIGGER_CLASS}>
            {t("security.modules.detail.permissionsTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SecurityCard title={t("security.modules.detail.information")}>
            <div className="flex max-w-2xl flex-col gap-2">
              <InfoRow label={t("security.fields.code")} value={module.applicationCode} />
              <InfoRow label={t("security.fields.name")} value={module.applicationName} />
              <InfoRow label={t("security.fields.description")} value={module.description} />
              <InfoRow
                label={t("security.fields.status")}
                value={<StatusBadge active={module.active} />}
              />
              <InfoRow
                label={t("security.modules.columns.permissions")}
                value={module.permissionCount}
              />
            </div>
          </SecurityCard>
        </TabsContent>

        <TabsContent value="permissions">
          <ModulePermissionsTab
            moduleId={moduleId}
            firstPage={detail.data.permissions}
            action={
              capabilities.canManagePermissionAssignments && (
                <Button size="sm" variant="outline" onClick={() => setPermissionsOpen(true)}>
                  <KeyRound className="size-4" />
                  {t("security.modules.managePermissions")}
                </Button>
              )
            }
          />
        </TabsContent>
      </Tabs>

      {capabilities.canManageDefinitions && (
        <ModuleFormDialog open={editOpen} onOpenChange={setEditOpen} module={module} />
      )}
      {capabilities.canManagePermissionAssignments && (
        <ModulePermissionsDialog
          module={module}
          open={permissionsOpen}
          onOpenChange={setPermissionsOpen}
        />
      )}
    </div>
  );
}
