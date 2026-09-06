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
  const { t } = useTranslation();
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
      toast.success(t("employees.employmentActions.terminate.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.employmentActions.terminate.error"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.employmentActions.terminate.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.employmentActions.terminate.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("employees.employmentActions.common.status")} error={errors.employeeStatusId?.message}>
              <SelectField
                control={control}
                name="employeeStatusId"
                placeholder={t("employees.employmentActions.common.selectStatus")}
                options={terminalStatuses.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                }))}
              />
            </LabeledField>

            <LabeledField
              label={t("employees.employmentActions.terminate.terminationDate")}
              error={errors.terminationDate?.message}
            >
              <Input type="date" {...register("terminationDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label={t("employees.employmentActions.common.reasonOptional")}>
                <Input
                  {...register("reason")}
                  placeholder={t("employees.employmentActions.terminate.reasonPlaceholder")}
                />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("employees.employmentActions.common.cancel")}
            </Button>

            <Button type="submit" variant="destructive" disabled={terminateEmployment.isPending}>
              {terminateEmployment.isPending
                ? t("employees.employmentActions.terminate.confirming")
                : t("employees.employmentActions.terminate.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
