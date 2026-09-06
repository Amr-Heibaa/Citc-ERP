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
import { Input } from "@/components/ui/input";
import { useEndContract } from "@/features/hr/employees/api/use-contracts";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import type { ContractDetail } from "@/lib/api/generated/model";

export function EndContractDialog({
  open,
  onOpenChange,
  employeeId,
  contract,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  contract: ContractDetail;
}) {
  const { t } = useTranslation();
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");

  const endContract = useEndContract(employeeId, contract.contractId ?? 0);

  async function handleConfirm() {
    try {
      await endContract.mutateAsync({ endDate, reason: reason.trim() || undefined });
      toast.success(t("employees.contractForm.endDialog.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.contractForm.endDialog.error"),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.contractForm.endDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.contractForm.endDialog.description", {
              number: contract.contractNumber ?? contract.contractId,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <LabeledField label={t("employees.contractForm.endDialog.endDate")}>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </LabeledField>

          <LabeledField label={t("employees.contractForm.endDialog.reasonOptional")}>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("employees.contractForm.endDialog.reasonPlaceholder")}
            />
          </LabeledField>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("employees.contractForm.endDialog.cancel")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={endContract.isPending}
            onClick={handleConfirm}
          >
            {endContract.isPending
              ? t("employees.contractForm.endDialog.saving")
              : t("employees.contractForm.endDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
