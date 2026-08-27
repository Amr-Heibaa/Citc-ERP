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
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");

  const endContract = useEndContract(employeeId, contract.contractId ?? 0);

  async function handleConfirm() {
    try {
      await endContract.mutateAsync({ endDate, reason: reason.trim() || undefined });
      toast.success("Contract ended");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to end contract",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#1a2535]">End Contract</DialogTitle>

          <DialogDescription>
            End contract #{contract.contractNumber ?? contract.contractId}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <LabeledField label="End Date">
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </LabeledField>

          <LabeledField label="Reason (Optional)">
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason for ending the contract"
            />
          </LabeledField>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={endContract.isPending}
            onClick={handleConfirm}
          >
            {endContract.isPending ? "Saving…" : "End Contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
