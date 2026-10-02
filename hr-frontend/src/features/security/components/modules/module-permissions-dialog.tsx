import { useTranslation } from "react-i18next";

import type { SecurityModuleSummary } from "@/features/security/api/security-types";
import {
  useAllSecurityModulePermissions,
  useSetSecurityModulePermissions,
} from "@/features/security/api/use-security-modules";
import { useAllSecurityPermissions } from "@/features/security/api/use-security-permissions";
import { WarningNote } from "@/features/security/components/assignment-editor";
import { AssignmentDialog } from "@/features/security/components/assignment-dialog";
import { permissionItem, withAssigned } from "@/features/security/utils/assignment-items";

/**
 * SYSTEM_ADMIN only — PUT /modules/{moduleId}/permissions. The backend moves
 * the selected permissions into this module and clears module membership for
 * removed ones, so the dialog warns before saving.
 */
export function ModulePermissionsDialog({
  module,
  open,
  onOpenChange,
}: {
  module: SecurityModuleSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const candidates = useAllSecurityPermissions(open);
  const current = useAllSecurityModulePermissions(module.applicationModuleId, open);
  const setPermissions = useSetSecurityModulePermissions(module.applicationModuleId);

  const all = withAssigned(candidates.data ?? [], current.data ?? [], (p) => p.permissionId);

  return (
    <AssignmentDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("security.modules.managePermissions")}
      description={t("security.modules.managePermissionsDescription", {
        name: module.applicationName,
      })}
      warning={<WarningNote>{t("security.modules.membershipWarning")}</WarningNote>}
      isLoading={candidates.isLoading || current.isLoading}
      error={candidates.error ?? current.error}
      onRetry={() => {
        void candidates.refetch();
        void current.refetch();
      }}
      items={all.map((permission) => permissionItem(permission, t))}
      initialIds={current.data?.map((permission) => permission.permissionId)}
      availableLabel={t("security.assign.availablePermissions")}
      assignedLabel={t("security.modules.modulePermissions")}
      searchPlaceholder={t("security.assign.searchPermissions")}
      onSave={(ids) => setPermissions.mutateAsync(ids)}
      saveLabel={t("security.assign.savePermissions")}
      successMessage={t("security.assign.saved")}
      errorFallbackKey="security.assign.saveError"
    />
  );
}
