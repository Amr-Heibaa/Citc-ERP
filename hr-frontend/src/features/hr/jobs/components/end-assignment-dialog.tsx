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
import { useEndJobPositionAssignment } from "@/features/hr/jobs/api/use-job-positions";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function EndAssignmentDialog({
  open,
  onOpenChange,
  position,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: JobPositionDetail;
}) {
  const { t } = useTranslation();
  const positionId = position.positionId ?? 0;
  const assignmentId = position.currentAssignment?.assignmentId ?? 0;

  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const endAssignment = useEndJobPositionAssignment(positionId, assignmentId);

  async function handleConfirm() {
    try {
      await endAssignment.mutateAsync({ endDate });
      toast.success(t("jobs.endAssignmentDialog.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("jobs.endAssignmentDialog.error"),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("jobs.endAssignmentDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("jobs.endAssignmentDialog.description", {
              employee:
                position.currentAssignment?.employeeName ??
                t("jobs.endAssignmentDialog.employeeFallback"),
            })}
          </DialogDescription>
        </DialogHeader>

        <LabeledField label={t("jobs.endAssignmentDialog.endDate")}>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </LabeledField>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("jobs.endAssignmentDialog.cancel")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={endAssignment.isPending}
            onClick={handleConfirm}
          >
            {endAssignment.isPending
              ? t("jobs.endAssignmentDialog.saving")
              : t("jobs.endAssignmentDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
