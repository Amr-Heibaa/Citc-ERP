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
import { useOrganizations, useStatuses } from "@/features/hr/employees/api/use-employees";
import {
  usePositionsForEmployment,
  useReactivateEmployment,
} from "@/features/hr/employees/api/use-employment";
import {
  ASSIGNMENT_TYPE_OPTIONS,
  REACTIVATION_STATUS_CODES,
  reactivateSchema,
  toReactivateRequest,
  type ReactivateFormValues,
} from "@/features/hr/employees/schemas/employment-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { EmploymentOverview } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: ReactivateFormValues = {
  organizationId: "",
  employeeStatusId: "",
  positionId: "",
  assignmentType: "1",
  startDate: "",
  endDate: "",
  reason: "",
};

export function ReactivateEmploymentDialog({
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
  const organizations = useOrganizations();
  const reactivateEmployment = useReactivateEmployment(employeeId);

  const reactivationStatuses = (statuses.data ?? []).filter((status) =>
    REACTIVATION_STATUS_CODES.includes(status.code ?? ""),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReactivateFormValues>({
    resolver: zodResolver(reactivateSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  // A terminated employee has no current organization (it's cleared on
  // termination), so we can't scope the position picker to overview.organizationId
  // like other dialogs do — the admin picks the org fresh here instead.
  const organizationId = useWatch({ control, name: "organizationId" });
  const selectedOrgId = organizationId ? Number(organizationId) : undefined;
  const positions = usePositionsForEmployment(selectedOrgId);

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

  useEffect(() => {
    setValue("positionId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const submit = handleSubmit(async (values) => {
    try {
      await reactivateEmployment.mutateAsync(toReactivateRequest(values));
      toast.success(t("employees.employmentActions.reactivate.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.employmentActions.reactivate.error"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.employmentActions.reactivate.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.employmentActions.reactivate.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LabeledField label={t("employees.employmentActions.common.organization")}>
                <SelectField
                  control={control}
                  name="organizationId"
                  placeholder={t("employees.employmentActions.common.selectOrganization")}
                  options={
                    organizations.data?.flatMap((organization) =>
                      organization.id == null
                        ? []
                        : [{ value: String(organization.id), label: organization.name }],
                    ) ?? []
                  }
                />
              </LabeledField>
            </div>

            <div className="sm:col-span-2">
              <LabeledField label={t("employees.employmentActions.common.position")} error={errors.positionId?.message}>
                <SelectField
                  control={control}
                  name="positionId"
                  placeholder={
                    selectedOrgId
                      ? t("employees.employmentActions.common.selectPosition")
                      : t("employees.employmentActions.common.selectOrganizationFirst")
                  }
                  disabled={!selectedOrgId}
                  options={
                    positions.data?.content?.flatMap((position) =>
                      position.positionId == null
                        ? []
                        : [
                            {
                              value: String(position.positionId),
                              label: `${position.titleEn} (${position.code})`,
                            },
                          ],
                    ) ?? []
                  }
                />
              </LabeledField>
            </div>

            <LabeledField label={t("employees.employmentActions.common.status")} error={errors.employeeStatusId?.message}>
              <SelectField
                control={control}
                name="employeeStatusId"
                placeholder={t("employees.employmentActions.common.selectStatus")}
                options={reactivationStatuses.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                }))}
              />
            </LabeledField>

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
                  placeholder={t("employees.employmentActions.reactivate.reasonPlaceholder")}
                />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("employees.employmentActions.common.cancel")}
            </Button>

            <Button type="submit" disabled={reactivateEmployment.isPending}>
              {reactivateEmployment.isPending
                ? t("employees.employmentActions.common.saving")
                : t("employees.employmentActions.reactivate.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
