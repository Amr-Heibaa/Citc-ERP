import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { useContractTypes } from "@/features/hr/employees/api/use-employees";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { WizardDesignArt } from "@/features/hr/employees/components/wizard-design-art";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { WizardFooter } from "@/features/hr/employees/components/wizard-footer";
import { WizardHeader } from "@/features/hr/employees/components/wizard-header";
import {
  contractSchema,
  type ContractFormValues,
  type EmployeeWizardData,
} from "@/features/hr/employees/schemas/employee-schema";

export function ContractStepForm({
  defaults,
  submit,
  back,
  skip,
  pending,
}: {
  defaults: EmployeeWizardData;
  submit: (values: ContractFormValues) => void;
  back: () => void;
  skip: () => void;
  pending: boolean;
}) {
  const { t } = useTranslation();

  const WORK_TYPE_OPTIONS = [
    { value: "Full Time", label: t("employees.contractForm.fields.fullTime") },
    { value: "Part Time", label: t("employees.contractForm.fields.partTime") },
  ];

  const types = useContractTypes();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),

    defaultValues: {
      contractTypeId: defaults.contractTypeId ?? "",
      contractNumber: defaults.contractNumber ?? "",
      contractStartDate: defaults.contractStartDate ?? defaults.startDate ?? "",
      contractEndDate: defaults.contractEndDate ?? "",
      salary: defaults.salary ?? "",
      salaryCurrency: defaults.salaryCurrency ?? "EGP",
      workingHoursPerWeek: defaults.workingHoursPerWeek ?? "",
      workingHoursPerMonth: defaults.workingHoursPerMonth ?? "",
      probationPeriodDays: defaults.probationPeriodDays ?? "",
      workType: defaults.workType ?? "Full Time",
      contractNotes: defaults.contractNotes ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <WizardHeader
        step={5}
        title={t("employees.wizard.contract.title")}
        description={t("employees.wizard.contract.description")}
      />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-5 gap-y-4 px-8 py-3 md:grid-cols-2">
          <LabeledField label={t("employees.wizard.contract.contractType")}>
            <SelectField
              control={control}
              name="contractTypeId"
              placeholder={t("employees.wizard.contract.contractType")}
              options={
                types.data?.map((type) => ({
                  value: String(type.id),
                  label: type.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.contract.contractNumber")}>
            <Input {...register("contractNumber")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.contract.startDate")}>
            <Input {...register("contractStartDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.wizard.contract.endDate")}>
            <Input {...register("contractEndDate")} type="date" />
          </LabeledField>

          <LabeledField
            label={t("employees.wizard.contract.workingHoursWeek")}
            error={errors.workingHoursPerWeek?.message}
          >
            <Input {...register("workingHoursPerWeek")} />
          </LabeledField>

          <LabeledField
            label={t("employees.wizard.contract.workingHoursMonth")}
            error={errors.workingHoursPerMonth?.message}
          >
            <Input {...register("workingHoursPerMonth")} />
          </LabeledField>

          <LabeledField
            label={t("employees.wizard.contract.probationPeriodDays")}
            error={errors.probationPeriodDays?.message}
          >
            <Input {...register("probationPeriodDays")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.contract.workType")}>
            <SelectField
              control={control}
              name="workType"
              placeholder={t("employees.wizard.contract.workType")}
              options={WORK_TYPE_OPTIONS}
            />
          </LabeledField>

          <div className="md:col-span-2">
            <LabeledField label={t("employees.wizard.contract.contractNotes")}>
              <textarea
                {...register("contractNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("employees.wizard.contract.contractNotesPlaceholder")}
              />
            </LabeledField>
          </div>
        </div>

        <WizardDesignArt />
      </div>

      <WizardFooter step={5} onBack={back} onSkip={skip} pending={pending} final />
    </form>
  );
}
