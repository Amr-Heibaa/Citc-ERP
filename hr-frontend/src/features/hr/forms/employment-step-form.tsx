import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
  useOrgUnits,
  useOrganizations,
  useStatuses,
} from "@/features/hr/api/use-employees";
import { SelectField } from "@/features/hr/components/select-field";
import { WizardField } from "@/features/hr/components/wizard-field";
import { WizardFooter } from "@/features/hr/components/wizard-footer";
import { WizardHeader } from "@/features/hr/components/wizard-header";
import { WizardDesignArt } from "@/features/hr/components/wizard-design-art";
import { Input } from "@/components/ui/input";
import {
  employmentSchema,
  type EmployeeWizardData,
  type EmploymentFormValues,
} from "@/features/hr/schemas/employee-schema";

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
        title="Employment"
        description="The employee employment information"
      />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-6 gap-y-5 px-8 py-4 md:grid-cols-2">
          <WizardField label="Employee Status">
            <SelectField
              control={control}
              name="employeeStatusId"
              placeholder="Employee Status"
              options={
                statuses.data?.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Hire Date">
            <Input {...register("hireDate")} type="date" />
          </WizardField>

          <WizardField label="Start Date">
            <Input {...register("startDate")} type="date" />
          </WizardField>

          <WizardField label="Organization">
            <SelectField
              control={control}
              name="organizationId"
              placeholder="Organization"
              options={
                organizations.data?.map((organization) => ({
                  value: String(organization.id),
                  label: organization.name,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Organization Unit">
            <SelectField
              control={control}
              name="currentOrgUnitId"
              placeholder="Organization Unit"
              options={
                visibleUnits?.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })) ?? []
              }
            />
          </WizardField>
        </div>

        <WizardDesignArt />
      </div>

      <WizardFooter step={3} onBack={back} onSkip={skip} />
    </form>
  );
}
