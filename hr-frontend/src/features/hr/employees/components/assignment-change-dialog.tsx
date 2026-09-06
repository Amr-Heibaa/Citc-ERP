import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  useChangeEmploymentAssignment,
  usePositionsForEmployment,
} from "@/features/hr/employees/api/use-employment";
import {
  ASSIGNMENT_TYPE_OPTIONS,
  assignmentChangeSchema,
  toAssignmentChangeRequest,
  type AssignmentChangeFormValues,
} from "@/features/hr/employees/schemas/employment-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { EmploymentOverview } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: AssignmentChangeFormValues = {
  positionId: "",
  assignmentType: "1",
  startDate: "",
  endDate: "",
  reason: "",
};

export function AssignmentChangeDialog({
  open,
  onOpenChange,
  overview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview: EmploymentOverview;
}) {
  const { t } = useTranslation();
  const employeeId = overview.employeeId ?? 0;
  const positions = usePositionsForEmployment(overview.organizationId);
  const changeAssignment = useChangeEmploymentAssignment(employeeId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AssignmentChangeFormValues>({
    resolver: zodResolver(assignmentChangeSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...EMPTY_DEFAULTS,
      startDate: new Date().toISOString().slice(0, 10),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = handleSubmit(async (values) => {
    try {
      await changeAssignment.mutateAsync(toAssignmentChangeRequest(values));
      toast.success(t("employees.employmentActions.assignmentChange.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("employees.employmentActions.assignmentChange.error"),
      );
    }
  });

  const candidatePositions =
    positions.data?.content?.filter(
      (position) => position.positionId !== overview.positionId,
    ) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.employmentActions.assignmentChange.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.employmentActions.assignmentChange.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LabeledField
                label={t("employees.employmentActions.common.newPosition")}
                error={errors.positionId?.message}
              >
                <SelectField
                  control={control}
                  name="positionId"
                  placeholder={t("employees.employmentActions.common.selectPosition")}
                  options={candidatePositions.flatMap((position) =>
                    position.positionId == null
                      ? []
                      : [
                          {
                            value: String(position.positionId),
                            label: `${position.titleEn} (${position.code})`,
                          },
                        ],
                  )}
                />
              </LabeledField>
            </div>

            <LabeledField
              label={t("employees.employmentActions.common.assignmentType")}
              error={errors.assignmentType?.message}
            >
              <SelectField
                control={control}
                name="assignmentType"
                placeholder={t("employees.employmentActions.common.selectType")}
                options={ASSIGNMENT_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.label),
                }))}
              />
            </LabeledField>

            <LabeledField label={t("employees.employmentActions.common.startDate")} error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </LabeledField>

            <LabeledField label={t("employees.employmentActions.common.endDateOptional")} error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label={t("employees.employmentActions.common.reasonOptional")}>
                <Input
                  {...register("reason")}
                  placeholder={t("employees.employmentActions.assignmentChange.reasonPlaceholder")}
                />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("employees.employmentActions.common.cancel")}
            </Button>

            <Button type="submit" disabled={changeAssignment.isPending}>
              {changeAssignment.isPending
                ? t("employees.employmentActions.common.saving")
                : t("employees.employmentActions.assignmentChange.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
