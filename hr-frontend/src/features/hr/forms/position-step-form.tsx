import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  useEmployees,
  useOrgUnits,
  usePositions,
} from "@/features/hr/api/use-employees";
import { SelectField } from "@/features/hr/components/select-field";
import { WizardDesignArt } from "@/features/hr/components/wizard-design-art";
import { WizardField } from "@/features/hr/components/wizard-field";
import { WizardFooter } from "@/features/hr/components/wizard-footer";
import { WizardHeader } from "@/features/hr/components/wizard-header";
import {
  positionSchema,
  type EmployeeWizardData,
  type PositionFormValues,
} from "@/features/hr/schemas/employee-schema";

const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "1", label: "Permanent" },
  { value: "2", label: "Acting" },
  { value: "3", label: "Temporary" },
];

export function PositionStepForm({
  defaults,
  next,
  back,
  skip,
}: {
  defaults: EmployeeWizardData;
  next: (values: PositionFormValues) => void;
  back: () => void;
  skip: () => void;
}) {
  const positions = usePositions();
  const units = useOrgUnits();
  const employees = useEmployees();

  const { control, register, handleSubmit } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),

    defaultValues: {
      positionId: defaults.positionId ?? "",
      positionOrgUnitId: defaults.positionOrgUnitId ?? defaults.currentOrgUnitId ?? "",
      assignmentType: defaults.assignmentType ?? "1",
      positionStartDate: defaults.positionStartDate ?? defaults.startDate ?? "",
      positionEndDate: defaults.positionEndDate ?? "",
      reportingToEmployeeId: defaults.reportingToEmployeeId ?? "",
    },
  });

  const orgUnitId = useWatch({ control, name: "positionOrgUnitId" });

  const visiblePositions = orgUnitId
    ? positions.data?.filter((position) => String(position.orgUnitId) === orgUnitId)
    : positions.data;

  return (
    <form onSubmit={handleSubmit(next)} className="flex min-h-0 flex-1 flex-col">
      <WizardHeader step={4} title="Positions" description="Position information" />

      <div className="flex min-h-0 flex-1">
        <div className="grid flex-1 grid-cols-1 content-center gap-x-6 gap-y-5 px-8 py-4 md:grid-cols-2">
          <WizardField label="Position">
            <SelectField
              control={control}
              name="positionId"
              placeholder="Position"
              options={
                visiblePositions?.map((position) => ({
                  value: String(position.id),
                  label: position.title,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Organization Unit">
            <SelectField
              control={control}
              name="positionOrgUnitId"
              placeholder="Organization Unit"
              options={
                units.data?.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Position Start Date">
            <Input {...register("positionStartDate")} type="date" />
          </WizardField>

          <WizardField label="Position End Date">
            <Input {...register("positionEndDate")} type="date" />
          </WizardField>

          <WizardField label="Reports To">
            <SelectField
              control={control}
              name="reportingToEmployeeId"
              placeholder="Reports To"
              options={
                employees.data?.map((employee) => ({
                  value: String(employee.employeeId),
                  label: employee.displayName ?? employee.employeeNumber,
                })) ?? []
              }
            />
          </WizardField>

          <WizardField label="Assignment Type">
            <SelectField
              control={control}
              name="assignmentType"
              placeholder="Assignment Type"
              options={ASSIGNMENT_TYPE_OPTIONS}
            />
          </WizardField>
        </div>

        <WizardDesignArt />
      </div>

      <WizardFooter step={4} onBack={back} onSkip={skip} />
    </form>
  );
}
