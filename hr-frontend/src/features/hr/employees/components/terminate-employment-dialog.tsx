import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { useStatuses } from "@/features/hr/employees/api/use-employees";
import { useTerminateEmployment } from "@/features/hr/employees/api/use-employment";
import {
  TERMINAL_STATUS_CODES,
  terminateSchema,
  toTerminateRequest,
  type TerminateFormValues,
} from "@/features/hr/employees/schemas/employment-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { EmploymentOverview } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: TerminateFormValues = {
  employeeStatusId: "",
  terminationDate: "",
  reason: "",
};

export function TerminateEmploymentDialog({
  open,
  onOpenChange,
  overview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview: EmploymentOverview;
}) {
  const employeeId = overview.employeeId ?? 0;
  const statuses = useStatuses();
  const terminateEmployment = useTerminateEmployment(employeeId);

  const terminalStatuses = (statuses.data ?? []).filter((status) =>
    TERMINAL_STATUS_CODES.includes(status.code ?? ""),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TerminateFormValues>({
    resolver: zodResolver(terminateSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...EMPTY_DEFAULTS,
      terminationDate: new Date().toISOString().slice(0, 10),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = handleSubmit(async (values) => {
    try {
      await terminateEmployment.mutateAsync(toTerminateRequest(values));
      toast.success("Employment terminated");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to terminate employment",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            Terminate Employment
          </DialogTitle>

          <DialogDescription>
            This will end the active position assignment, close the current
            employment period and any active contracts, and clear the
            employee&apos;s organization unit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label="Status" error={errors.employeeStatusId?.message}>
              <SelectField
                control={control}
                name="employeeStatusId"
                placeholder="Select status"
                options={terminalStatuses.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                }))}
              />
            </LabeledField>

            <LabeledField
              label="Termination Date"
              error={errors.terminationDate?.message}
            >
              <Input type="date" {...register("terminationDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label="Reason (Optional)">
                <Input {...register("reason")} placeholder="Reason for termination" />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="destructive" disabled={terminateEmployment.isPending}>
              {terminateEmployment.isPending ? "Terminating…" : "Terminate Employment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
