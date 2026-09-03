import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  useAssignEmployeeToPosition,
  useEmployeesForJobs,
  useEndJobPositionAssignment,
} from "@/features/hr/jobs/api/use-job-positions";
import {
  ASSIGNMENT_TYPE_OPTIONS,
  assignEmployeeSchema,
  type AssignEmployeeFormValues,
} from "@/features/hr/jobs/schemas/assign-employee-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { JobPositionDetail } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: AssignEmployeeFormValues = {
  employeeId: "",
  assignmentType: "1",
  primary: true,
  startDate: "",
  endDate: "",
};

export function AssignEmployeeDialog({
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
  const currentAssignmentId = position.currentAssignment?.assignmentId ?? 0;
  const employees = useEmployeesForJobs();
  const assignEmployee = useAssignEmployeeToPosition(positionId);
  const endAssignment = useEndJobPositionAssignment(positionId, currentAssignmentId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AssignEmployeeFormValues>({
    resolver: zodResolver(assignEmployeeSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const employeeId = useWatch({ control, name: "employeeId" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(EMPTY_DEFAULTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isReassign = position.currentAssignment != null;

  const submit = handleSubmit(async (values) => {
    try {
      if (isReassign && currentAssignmentId) {
        await endAssignment.mutateAsync({ endDate: values.startDate });
      }

      await assignEmployee.mutateAsync({
        employeeId: Number(values.employeeId),
        assignmentType: Number(values.assignmentType),
        primary: values.primary,
        startDate: values.startDate,
        endDate: values.endDate?.trim() || undefined,
      });

      toast.success(
        isReassign
          ? t("jobs.assignDialog.changedSuccess")
          : t("jobs.assignDialog.assignedSuccess"),
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("jobs.assignDialog.unableToAssign"),
      );
    }
  });

  const isSaving = assignEmployee.isPending || endAssignment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {isReassign ? t("jobs.assignDialog.changeTitle") : t("jobs.assignDialog.assignTitle")}
          </DialogTitle>

          <DialogDescription>
            {isReassign
              ? t("jobs.assignDialog.changeDescription", { position: position.titleEn })
              : t("jobs.assignDialog.assignDescription", {
                  position: position.titleEn,
                  code: position.code,
                })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LabeledField label={t("jobs.assignDialog.employee")} error={errors.employeeId?.message}>
                <SelectField
                  control={control}
                  name="employeeId"
                  placeholder={t("jobs.assignDialog.selectEmployee")}
                  options={
                    employees.data?.flatMap((employee) =>
                      employee.employeeId == null
                        ? []
                        : [
                            {
                              value: String(employee.employeeId),
                              label: `${employee.displayName} (${employee.employeeNumber})`,
                            },
                          ],
                    ) ?? []
                  }
                />
              </LabeledField>
            </div>

            <LabeledField label={t("jobs.assignDialog.assignmentType")} error={errors.assignmentType?.message}>
              <SelectField
                control={control}
                name="assignmentType"
                placeholder={t("jobs.assignDialog.selectType")}
                options={ASSIGNMENT_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.label),
                }))}
              />
            </LabeledField>

            <LabeledField label={t("jobs.assignDialog.startDate")} error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </LabeledField>

            <LabeledField label={t("jobs.assignDialog.endDateOptional")} error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("jobs.assignDialog.cancel")}
            </Button>

            <Button type="submit" disabled={isSaving || !employeeId}>
              {isSaving
                ? t("jobs.assignDialog.saving")
                : isReassign
                  ? t("jobs.assignDialog.update")
                  : t("jobs.assignDialog.assign")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
