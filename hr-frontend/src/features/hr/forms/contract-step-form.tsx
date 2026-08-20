import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { useContractTypes } from "@/features/hr/api/use-employees";
import { SelectField } from "@/features/hr/components/select-field";
import { WizardDesignArt } from "@/features/hr/components/wizard-design-art";
import { WizardField } from "@/features/hr/components/wizard-field";
import { WizardFooter } from "@/features/hr/components/wizard-footer";
import { WizardHeader } from "@/features/hr/components/wizard-header";
import {
  contractSchema,
  type ContractFormValues,
  type EmployeeWizardData,
} from "@/features/hr/schemas/employee-schema";

const WORK_TYPE_OPTIONS = [
  { value: "Full Time", label: "Full Time" },
  { value: "Part Time", label: "Part Time" },
];

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
        title="Contract"
        description="The employee contract information"
      />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-5 gap-y-4 px-8 py-3 md:grid-cols-2">
          <WizardField label="Contract Type">
            <SelectField
              control={control}
              name="contractTypeId"
              placeholder="Contract Type"
              options={
                types.data?.map((type) => ({
                  value: String(type.id),
                  label: type.name,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Contract Number">
            <Input {...register("contractNumber")} />
          </WizardField>

          <WizardField label="Start Date">
            <Input {...register("contractStartDate")} type="date" />
          </WizardField>

          <WizardField label="End Date">
            <Input {...register("contractEndDate")} type="date" />
          </WizardField>

          <WizardField
            label="Working Hours / Week"
            error={errors.workingHoursPerWeek?.message}
          >
            <Input {...register("workingHoursPerWeek")} />
          </WizardField>

          <WizardField
            label="Working Hours / Month"
            error={errors.workingHoursPerMonth?.message}
          >
            <Input {...register("workingHoursPerMonth")} />
          </WizardField>

          <WizardField
            label="Probation Period (Days)"
            error={errors.probationPeriodDays?.message}
          >
            <Input {...register("probationPeriodDays")} />
          </WizardField>

          <WizardField label="Work Type">
            <SelectField
              control={control}
              name="workType"
              placeholder="Work Type"
              options={WORK_TYPE_OPTIONS}
            />
          </WizardField>

          <div className="md:col-span-2">
            <WizardField label="Contract Notes">
              <textarea
                {...register("contractNotes")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Contract notes"
              />
            </WizardField>
          </div>
        </div>

        <WizardDesignArt />
      </div>

      <WizardFooter step={5} onBack={back} onSkip={skip} pending={pending} final />
    </form>
  );
}
