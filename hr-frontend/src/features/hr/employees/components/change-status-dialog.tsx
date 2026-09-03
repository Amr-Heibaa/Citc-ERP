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
import { useUpdateEmploymentStatus } from "@/features/hr/employees/api/use-employment";
import { useStatuses } from "@/features/hr/employees/api/use-employees";
import {
  TERMINAL_STATUS_CODES,
  toUpdateStatusRequest,
  updateStatusSchema,
  type UpdateStatusFormValues,
} from "@/features/hr/employees/schemas/employment-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { EmploymentOverview } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: UpdateStatusFormValues = {
  employeeStatusId: "",
  effectiveDate: "",
  reason: "",
};

export function ChangeStatusDialog({
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
  const statuses = useStatuses();
  const updateStatus = useUpdateEmploymentStatus(employeeId);

  const nonTerminalStatuses = (statuses.data ?? []).filter(
    (status) => !TERMINAL_STATUS_CODES.includes(status.code ?? ""),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...EMPTY_DEFAULTS,
      employeeStatusId:
        overview.employeeStatusId != null ? String(overview.employeeStatusId) : "",
      effectiveDate: new Date().toISOString().slice(0, 10),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, overview.employeeStatusId]);

  const submit = handleSubmit(async (values) => {
    try {
      await updateStatus.mutateAsync(toUpdateStatusRequest(values));
      toast.success(t("employees.employmentActions.changeStatus.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.employmentActions.changeStatus.error"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.employmentActions.changeStatus.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.employmentActions.changeStatus.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LabeledField label={t("employees.employmentActions.common.status")} error={errors.employeeStatusId?.message}>
                <SelectField
                  control={control}
                  name="employeeStatusId"
                  placeholder={t("employees.employmentActions.common.selectStatus")}
                  options={nonTerminalStatuses.map((status) => ({
                    value: String(status.id),
                    label: status.name,
                  }))}
                />
              </LabeledField>
            </div>

            <LabeledField
              label={t("employees.employmentActions.changeStatus.effectiveDate")}
              error={errors.effectiveDate?.message}
            >
              <Input type="date" {...register("effectiveDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label={t("employees.employmentActions.common.reasonOptional")}>
                <Input
                  {...register("reason")}
                  placeholder={t("employees.employmentActions.changeStatus.reasonPlaceholder")}
                />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("employees.employmentActions.common.cancel")}
            </Button>

            <Button type="submit" disabled={updateStatus.isPending}>
              {updateStatus.isPending
                ? t("employees.employmentActions.common.saving")
                : t("employees.employmentActions.changeStatus.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
