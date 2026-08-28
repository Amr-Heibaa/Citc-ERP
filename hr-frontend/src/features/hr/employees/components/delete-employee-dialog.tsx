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
import { useDeleteEmployee } from "@/features/hr/employees/api/use-employees";
import {
  reasonSchema,
  toDeleteEmployeeRequest,
  type ReasonFormValues,
} from "@/features/hr/employees/schemas/employee-lifecycle-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";

const EMPTY_DEFAULTS: ReasonFormValues = { reason: "" };

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  employeeName: string;
  onDeleted: () => void;
}) {
  const deleteEmployee = useDeleteEmployee(employeeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_DEFAULTS);
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await deleteEmployee.mutateAsync(toDeleteEmployeeRequest(values));
      toast.success(`${employeeName} deleted`);
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete employee",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            Delete Employee
          </DialogTitle>

          <DialogDescription>
            {employeeName} will be removed from active records. This can be
            undone later from the Deleted Employees list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="px-6 py-5">
            <LabeledField label="Reason" error={errors.reason?.message}>
              <Input
                {...register("reason")}
                placeholder="Why is this employee being deleted?"
                autoFocus
              />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="destructive" disabled={deleteEmployee.isPending}>
              {deleteEmployee.isPending ? "Deleting…" : "Delete Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
