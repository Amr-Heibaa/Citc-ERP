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
import { useContractTypes } from "@/features/hr/employees/api/use-employees";
import { useRenewContract } from "@/features/hr/employees/api/use-contracts";
import {
  contractSchema,
  toContractRequest,
  type ContractFormValues,
} from "@/features/hr/employees/schemas/contract-schema";
import { useContractTemplates } from "@/features/hr/hr-settings/api/use-contract-templates";
import { BooleanSelectField } from "@/features/hr/shared/components/boolean-select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { ContractDetail } from "@/lib/api/generated/model";

export function RenewContractDialog({
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
  const { t } = useTranslation();
  const types = useContractTypes();
  const templates = useContractTemplates();
  const renewContract = useRenewContract(employeeId, contract.contractId ?? 0);

  function buildDefaults(): ContractFormValues {
    return {
      contractTypeId: contract.contractTypeId != null ? String(contract.contractTypeId) : "",
      contractTemplateId:
        contract.contractTemplateId != null ? String(contract.contractTemplateId) : "",
      contractNumber: "",
      contractDate: "",
      startDate: "",
      endDate: "",
      salaryBasis: contract.salaryBasis ?? "MONTHLY",
      salary: contract.salary != null ? String(contract.salary) : "",
      salaryCurrency: contract.salaryCurrency ?? "EGP",
      hourlyRate: contract.hourlyRate != null ? String(contract.hourlyRate) : "",
      maxMonthlyHours:
        contract.maxMonthlyHours != null ? String(contract.maxMonthlyHours) : "",
      workingHoursPerWeek:
        contract.workingHoursPerWeek != null ? String(contract.workingHoursPerWeek) : "",
      workingHoursPerMonth:
        contract.workingHoursPerMonth != null ? String(contract.workingHoursPerMonth) : "",
      probationPeriodDays: "",
      noticePeriodDays: "",
      fulltime: contract.fulltime ?? true,
      projectName: contract.projectName ?? "",
      externalEmployerName: contract.externalEmployerName ?? "",
      externalLeaveStartDate: "",
      externalLeaveEndDate: "",
      notes: "",
    };
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: buildDefaults(),
  });

  const fulltime = useWatch({ control, name: "fulltime" });
  const contractTypeId = useWatch({ control, name: "contractTypeId" });

  const templateOptions =
    templates.data
      ?.filter((template) => String(template.contractTypeId) === contractTypeId)
      .map((template) => ({
        value: String(template.contractTemplateId),
        label: template.templateNameEn ?? template.templateCode,
      })) ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(buildDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contract]);

  const submit = handleSubmit(async (values) => {
    try {
      await renewContract.mutateAsync(toContractRequest(values));
      toast.success(t("employees.contractForm.renewDialog.renewedSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("employees.contractForm.renewDialog.unableToRenew"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl gap-0 overflow-hidden p-0 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.contractForm.renewDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.contractForm.renewDialog.description", {
              number: contract.contractNumber ?? contract.contractId,
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("employees.contractForm.fields.contractType")} error={errors.contractTypeId?.message}>
              <SelectField
                control={control}
                name="contractTypeId"
                placeholder={t("employees.contractForm.fields.selectType")}
                options={
                  types.data?.map((type) => ({
                    value: String(type.id),
                    label: type.name,
                  })) ?? []
                }
              />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.contractTemplate")}
              error={errors.contractTemplateId?.message}
            >
              <SelectField
                control={control}
                name="contractTemplateId"
                placeholder={
                  contractTypeId
                    ? t("employees.contractForm.fields.selectTemplate")
                    : t("employees.contractForm.fields.selectTypeFirst")
                }
                disabled={!contractTypeId}
                options={templateOptions}
              />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.renewDialog.newContractNumber")}
              error={errors.contractNumber?.message}
            >
              <Input {...register("contractNumber")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.contractDate")} error={errors.contractDate?.message}>
              <Input type="date" {...register("contractDate")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.startDate")} error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.endDateOptional")} error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.salaryBasis")} error={errors.salaryBasis?.message}>
              <SelectField
                control={control}
                name="salaryBasis"
                placeholder={t("employees.contractForm.fields.selectSalaryBasis")}
                options={[
                  { value: "MONTHLY", label: t("employees.contractForm.fields.monthly") },
                  { value: "HOURLY", label: t("employees.contractForm.fields.hourly") },
                ]}
              />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.salary")} error={errors.salary?.message}>
              <Input {...register("salary")} placeholder={t("employees.contractForm.fields.salaryPlaceholder")} />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.salaryCurrency")}
              error={errors.salaryCurrency?.message}
            >
              <Input
                {...register("salaryCurrency")}
                placeholder={t("employees.contractForm.fields.salaryCurrencyPlaceholder")}
              />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.hourlyRateOptional")}
              error={errors.hourlyRate?.message}
            >
              <Input
                {...register("hourlyRate")}
                placeholder={t("employees.contractForm.fields.hourlyRatePlaceholder")}
              />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.maxMonthlyHoursOptional")}
              error={errors.maxMonthlyHours?.message}
            >
              <Input {...register("maxMonthlyHours")} />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.workingHoursWeek")}
              error={errors.workingHoursPerWeek?.message}
            >
              <Input {...register("workingHoursPerWeek")} />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.workingHoursMonth")}
              error={errors.workingHoursPerMonth?.message}
            >
              <Input {...register("workingHoursPerMonth")} />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.probationPeriodDays")}
              error={errors.probationPeriodDays?.message}
            >
              <Input {...register("probationPeriodDays")} />
            </LabeledField>

            <LabeledField
              label={t("employees.contractForm.fields.noticePeriodDays")}
              error={errors.noticePeriodDays?.message}
            >
              <Input {...register("noticePeriodDays")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.workType")}>
              <BooleanSelectField
                value={fulltime}
                onChange={(checked) => setValue("fulltime", checked)}
                trueLabel={t("employees.contractForm.fields.fullTime")}
                falseLabel={t("employees.contractForm.fields.partTime")}
              />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.projectNameOptional")}>
              <Input {...register("projectName")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.externalEmployerOptional")}>
              <Input {...register("externalEmployerName")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.externalLeaveStartOptional")}>
              <Input type="date" {...register("externalLeaveStartDate")} />
            </LabeledField>

            <LabeledField label={t("employees.contractForm.fields.externalLeaveEndOptional")}>
              <Input type="date" {...register("externalLeaveEndDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label={t("employees.contractForm.fields.notesOptional")}>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t("employees.contractForm.fields.notesPlaceholder")}
                />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("employees.contractForm.dialog.cancel")}
            </Button>

            <Button type="submit" disabled={renewContract.isPending}>
              {renewContract.isPending
                ? t("employees.contractForm.dialog.saving")
                : t("employees.contractForm.renewDialog.renewButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
