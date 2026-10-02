import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBulkAssignRolePermissions } from "@/features/security/api/use-security-assignments";
import { useAllSecurityPermissions } from "@/features/security/api/use-security-permissions";
import { useAllSecurityRoles } from "@/features/security/api/use-security-roles";
import {
  BulkModeChooser,
  BulkSummary,
  WizardStepper,
  type BulkMode,
} from "@/features/security/components/bulk/bulk-wizard";
import { DualPanelTransfer } from "@/features/security/components/dual-panel-transfer";
import { ErrorState, PanelSkeleton } from "@/features/security/components/security-states";
import { MAX_BULK_PAIRS } from "@/features/security/schemas/assignment-limits";
import { permissionItem, roleItem } from "@/features/security/utils/assignment-items";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

/** SYSTEM_ADMIN only: choose roles → choose permissions → confirm. */
function BulkRolePermissionsWizard({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const roles = useAllSecurityRoles();
  const permissions = useAllSecurityPermissions();
  const bulkAssign = useBulkAssignRolePermissions();

  const [step, setStep] = useState(0);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [permissionIds, setPermissionIds] = useState<number[]>([]);
  const [mode, setMode] = useState<BulkMode>("add");

  const roleItems = (roles.data ?? []).map((role) => roleItem(role, t));
  const permissionItems = (permissions.data ?? []).map((permission) =>
    permissionItem(permission, t),
  );
  const pairs = roleIds.length * permissionIds.length;

  const steps = [
    t("security.bulk.stepRoles"),
    t("security.bulk.stepPermissions"),
    t("security.bulk.stepConfirm"),
  ];

  async function submit() {
    try {
      await bulkAssign.mutateAsync({
        roleIds,
        permissionIds,
        replaceExisting: mode === "replace",
      });
      toast.success(t("security.bulk.rolePermissionsSuccess"));
      onDone();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, "security.bulk.error"));
    }
  }

  const loadError = roles.error ?? permissions.error;
  const loading = roles.isLoading || permissions.isLoading;
  const canContinue = step === 0 ? roleIds.length > 0 : permissionIds.length > 0;

  return (
    <>
      <div className="flex flex-col gap-5 px-6 py-5">
        <WizardStepper steps={steps} current={step} />

        {loadError ? (
          <ErrorState
            error={loadError}
            onRetry={() => {
              void roles.refetch();
              void permissions.refetch();
            }}
          />
        ) : loading ? (
          <PanelSkeleton rows={6} />
        ) : step === 0 ? (
          <DualPanelTransfer
            items={roleItems}
            value={roleIds}
            onChange={setRoleIds}
            availableLabel={t("security.assign.availableRoles")}
            assignedLabel={t("security.bulk.selectedRoles")}
            searchPlaceholder={t("security.assign.searchRoles")}
          />
        ) : step === 1 ? (
          <DualPanelTransfer
            items={permissionItems}
            value={permissionIds}
            onChange={setPermissionIds}
            availableLabel={t("security.assign.availablePermissions")}
            assignedLabel={t("security.bulk.selectedPermissions")}
            searchPlaceholder={t("security.assign.searchPermissions")}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <BulkSummary
              leftTitle={t("security.bulk.selectedRoles")}
              leftItems={roleItems.filter((item) => roleIds.includes(item.id)).map((item) => item.label)}
              rightTitle={t("security.bulk.selectedPermissions")}
              rightItems={permissionItems
                .filter((item) => permissionIds.includes(item.id))
                .map((item) => item.label)}
              pairs={pairs}
            />
            <BulkModeChooser
              mode={mode}
              onModeChange={setMode}
              addDescription={t("security.bulk.rolePermissionsAdd")}
              replaceDescription={t("security.bulk.rolePermissionsReplace")}
            />
          </div>
        )}
      </div>

      <DialogFooter className="border-t border-gray-100 px-6 py-4 sm:justify-between">
        <Button type="button" variant="outline" onClick={onDone} disabled={bulkAssign.isPending}>
          {t("common.cancel")}
        </Button>

        <div className="flex gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={bulkAssign.isPending}
            >
              {t("common.back")}
            </Button>
          )}
          {step < 2 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canContinue}
              className="bg-[#1a2535] text-white hover:bg-[#243347]"
            >
              {t("common.next")}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={bulkAssign.isPending || pairs === 0 || pairs > MAX_BULK_PAIRS}
              className="bg-[#f5841f] text-white hover:bg-[#e07413]"
            >
              {bulkAssign.isPending
                ? t("security.common.working")
                : t("security.bulk.assignPermissions")}
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  );
}

export function BulkRolePermissionsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="font-['Space_Grotesk',sans-serif] text-xl text-[#1a2535]">
            {t("security.bulk.rolePermissionsTitle")}
          </DialogTitle>
          <DialogDescription>{t("security.bulk.rolePermissionsDescription")}</DialogDescription>
        </DialogHeader>

        <BulkRolePermissionsWizard onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
