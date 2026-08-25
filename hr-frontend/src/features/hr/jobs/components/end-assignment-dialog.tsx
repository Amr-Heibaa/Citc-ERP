import { useState } from "react";
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
  const positionId = position.positionId ?? 0;
  const assignmentId = position.currentAssignment?.assignmentId ?? 0;

  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const endAssignment = useEndJobPositionAssignment(positionId, assignmentId);

  async function handleConfirm() {
    try {
      await endAssignment.mutateAsync({ endDate });
      toast.success("Assignment ended successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to end assignment",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#1a2535]">
            End Assignment
          </DialogTitle>

          <DialogDescription>
            End {position.currentAssignment?.employeeName ?? "the current employee"}
            's assignment. The position will become open.
          </DialogDescription>
        </DialogHeader>

        <LabeledField label="End Date">
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </LabeledField>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={endAssignment.isPending}
            onClick={handleConfirm}
          >
            {endAssignment.isPending ? "Saving…" : "End Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
