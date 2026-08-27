import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  useCreateEmployeeStatus,
  useUpdateEmployeeStatus,
} from "@/features/hr/hr-settings/api/use-employee-statuses";
import {
  employeeStatusSchema,
  employeeStatusToFormValues,
  toEmployeeStatusRequest,
  type EmployeeStatusFormValues,
} from "@/features/hr/hr-settings/schemas/employee-status-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { EmployeeStatusSetting } from "@/lib/api/generated/model";

export function EmployeeStatusFormDialog({
  open,
  onOpenChange,
  status,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: EmployeeStatusSetting;
}) {
  const editMode = status != null;
  const employeeStatusId = status?.employeeStatusId ?? 0;

  const createStatus = useCreateEmployeeStatus();
  const updateStatus = useUpdateEmployeeStatus(employeeStatusId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeStatusFormValues>({
    resolver: zodResolver(employeeStatusSchema),
    defaultValues: employeeStatusToFormValues(status),
  });

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(employeeStatusToFormValues(status));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status]);

  const pending = createStatus.isPending || updateStatus.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateStatus.mutateAsync(toEmployeeStatusRequest(values));
        toast.success("Employee status updated successfully");
      } else {
        await createStatus.mutateAsync(toEmployeeStatusRequest(values));
        toast.success("Employee status added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save employee status",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode ? "Edit Employee Status" : "Add Employee Status"}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? `Update the details for ${status.code}.`
              : "Create a new employee status."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label="Code" error={errors.code?.message}>
              <Input {...register("code")} placeholder="ACTIVE" />
            </LabeledField>

            <LabeledField label="Status">
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>

            <LabeledField label="Name (English)" error={errors.nameEn?.message}>
              <Input {...register("nameEn")} />
            </LabeledField>

            <LabeledField label="Name (Arabic)" error={errors.nameAr?.message}>
              <Input {...register("nameAr")} dir="rtl" />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label="Description (Optional)" error={errors.description?.message}>
                <Input {...register("description")} />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editMode ? "Save Changes" : "Add Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
