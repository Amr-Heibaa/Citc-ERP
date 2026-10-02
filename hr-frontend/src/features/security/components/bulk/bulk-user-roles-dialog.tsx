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
import { useBulkAssignUserRoles } from "@/features/security/api/use-security-assignments";
import { useSecurityAccess } from "@/features/security/api/use-security-access";
import { useAllSecurityRoles } from "@/features/security/api/use-security-roles";
import { useAllSecurityUsers } from "@/features/security/api/use-security-users";
import {
  BulkModeChooser,
  BulkSummary,
  WizardStepper,
  type BulkMode,
} from "@/features/security/components/bulk/bulk-wizard";
import { DualPanelTransfer } from "@/features/security/components/dual-panel-transfer";
import { ErrorState, PanelSkeleton } from "@/features/security/components/security-states";
import { MAX_BULK_PAIRS } from "@/features/security/schemas/assignment-limits";
import { roleItem, userItem } from "@/features/security/utils/assignment-items";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

/** Choose users → choose roles → confirm. No assignment dates (unsupported). */
function BulkUserRolesWizard({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const { capabilities } = useSecurityAccess();
  const users = useAllSecurityUsers();
  const roles = useAllSecurityRoles();
  const bulkAssign = useBulkAssignUserRoles();

  const [step, setStep] = useState(0);
  const [userIds, setUserIds] = useState<number[]>([]);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [mode, setMode] = useState<BulkMode>("add");

  const hrAdminOnly = capabilities.isHrAdmin && !capabilities.isSystemAdmin;
  const userItems = (users.data ?? []).map((user) => userItem(user, t, capabilities));
  const roleItems = (roles.data ?? []).map((role) => roleItem(role, t, capabilities));
  const pairs = userIds.length * roleIds.length;

  const steps = [
    t("security.bulk.stepUsers"),
    t("security.bulk.stepRoles"),
    t("security.bulk.stepConfirm"),
  ];

  async function submit() {
    try {
      await bulkAssign.mutateAsync({ userIds, roleIds, replaceExisting: mode === "replace" });
      toast.success(t("security.bulk.userRolesSuccess"));
      onDone();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, "security.bulk.error"));
    }
  }

  const loadError = users.error ?? roles.error;
  const loading = users.isLoading || roles.isLoading;
  const canContinue = step === 0 ? userIds.length > 0 : roleIds.length > 0;

  return (
    <>
      <div className="flex flex-col gap-5 px-6 py-5">
        <WizardStepper steps={steps} current={step} />

        {loadError ? (
          <ErrorState
            error={loadError}
            onRetry={() => {
              void users.refetch();
              void roles.refetch();
            }}
          />
        ) : loading ? (
          <PanelSkeleton rows={6} />
        ) : step === 0 ? (
          <DualPanelTransfer
            items={userItems}
            value={userIds}
            onChange={setUserIds}
            availableLabel={t("security.assign.availableUsers")}
            assignedLabel={t("security.bulk.selectedUsers")}
            searchPlaceholder={t("security.assign.searchUsers")}
          />
        ) : step === 1 ? (
          <DualPanelTransfer
            items={roleItems}
            value={roleIds}
            onChange={setRoleIds}
            availableLabel={t("security.assign.availableRoles")}
            assignedLabel={t("security.bulk.selectedRoles")}
            searchPlaceholder={t("security.assign.searchRoles")}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <BulkSummary
              leftTitle={t("security.bulk.selectedUsers")}
              leftItems={userItems
                .filter((item) => userIds.includes(item.id))
                .map((item) => item.label)}
              rightTitle={t("security.bulk.selectedRoles")}
              rightItems={roleItems
                .filter((item) => roleIds.includes(item.id))
                .map((item) => item.label)}
              pairs={pairs}
            />
            <BulkModeChooser
              mode={mode}
              onModeChange={setMode}
              addDescription={t("security.bulk.userRolesAdd")}
              replaceDescription={t("security.bulk.userRolesReplace")}
              replaceDisabledReason={hrAdminOnly ? t("security.bulk.replaceHrAdmin") : undefined}
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
              {bulkAssign.isPending ? t("security.common.working") : t("security.bulk.assignRoles")}
            </Button>
          )}
        </div>
      </DialogFooter>
    </>
  );
}

export function BulkUserRolesDialog({
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
            {t("security.bulk.userRolesTitle")}
          </DialogTitle>
          <DialogDescription>{t("security.bulk.userRolesDescription")}</DialogDescription>
        </DialogHeader>

        <BulkUserRolesWizard onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
