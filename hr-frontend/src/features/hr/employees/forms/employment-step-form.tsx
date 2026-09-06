import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  useOrgUnits,
  useOrganizations,
  useStatuses,
} from "@/features/hr/employees/api/use-employees";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { WizardFooter } from "@/features/hr/employees/components/wizard-footer";
import { WizardHeader } from "@/features/hr/employees/components/wizard-header";
import { WizardDesignArt } from "@/features/hr/employees/components/wizard-design-art";
import { Input } from "@/components/ui/input";
import {
  employmentSchema,
  type EmployeeWizardData,
  type EmploymentFormValues,
} from "@/features/hr/employees/schemas/employee-schema";

export function EmploymentStepForm({
  defaults,
  next,
  back,
  skip,
}: {
  defaults: EmployeeWizardData;
  next: (values: EmploymentFormValues) => void;
  back: () => void;
  skip: () => void;
}) {
  const { t } = useTranslation();
  const statuses = useStatuses();
  const organizations = useOrganizations();
  const units = useOrgUnits();

  const { register, control, handleSubmit } = useForm<EmploymentFormValues>({
    resolver: zodResolver(employmentSchema),

    defaultValues: {
      employeeNumber: defaults.employeeNumber ?? "",
      organizationId: defaults.organizationId ?? "",
      currentOrgUnitId: defaults.currentOrgUnitId ?? "",
      employeeStatusId: defaults.employeeStatusId ?? "",
      hireDate: defaults.hireDate ?? "",
      startDate: defaults.startDate ?? "",
    },
  });

  const organizationId = useWatch({ control, name: "organizationId" });

  const visibleUnits = organizationId
    ? units.data?.filter((unit) => String(unit.organizationId) === organizationId)
    : units.data;

  return (
    <form onSubmit={handleSubmit(next)} className="flex min-h-0 flex-1 flex-col">
      <WizardHeader
        step={3}
        title={t("employees.wizard.employment.title")}
        description={t("employees.wizard.employment.description")}
      />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-6 gap-y-5 px-8 py-4 md:grid-cols-2">
          <LabeledField label={t("employees.wizard.employment.employeeStatus")}>
            <SelectField
              control={control}
              name="employeeStatusId"
              placeholder={t("employees.wizard.employment.employeeStatus")}
              options={
                statuses.data?.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.employment.hireDate")}>
            <Input {...register("hireDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.wizard.employment.startDate")}>
            <Input {...register("startDate")} type="date" />
          </LabeledField>

          <LabeledField label={t("employees.wizard.employment.organization")}>
            <SelectField
              control={control}
              name="organizationId"
              placeholder={t("employees.wizard.employment.organization")}
              options={
                organizations.data?.map((organization) => ({
                  value: String(organization.id),
                  label: organization.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("employees.wizard.employment.organizationUnit")}>
            <SelectField
              control={control}
              name="currentOrgUnitId"
              placeholder={t("employees.wizard.employment.organizationUnit")}
              options={
                visibleUnits?.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })) ?? []
              }
            />
          </LabeledField>
        </div>

        <WizardDesignArt />
      </div>

      <WizardFooter step={3} onBack={back} onSkip={skip} />
    </form>
  );
}
