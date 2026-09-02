import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
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
import { useCreateContract, useUpdateContract } from "@/features/hr/employees/api/use-contracts";
import {
  contractSchema,
  contractToFormValues,
  toContractRequest,
  type ContractFormValues,
} from "@/features/hr/employees/schemas/contract-schema";
import { useContractTemplates } from "@/features/hr/hr-settings/api/use-contract-templates";
import { BooleanSelectField } from "@/features/hr/shared/components/boolean-select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { ContractDetail } from "@/lib/api/generated/model";

export function ContractFieldsGrid({
  register,
  control,
  errors,
  setValue,
  fulltime,
  contractTypeId,
  typeOptions,
  templateOptions,
}: {
  register: UseFormRegister<ContractFormValues>;
  control: Control<ContractFormValues>;
  errors: FieldErrors<ContractFormValues>;
  setValue: UseFormSetValue<ContractFormValues>;
  fulltime: boolean;
  contractTypeId: string;
  typeOptions: { value: string; label: string | undefined }[];
  templateOptions: { value: string; label: string | undefined }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <LabeledField label="Contract Type" error={errors.contractTypeId?.message}>
        <SelectField
          control={control}
          name="contractTypeId"
          placeholder="Select type"
          options={typeOptions}
        />
      </LabeledField>

      <LabeledField label="Contract Template" error={errors.contractTemplateId?.message}>
        <SelectField
          control={control}
          name="contractTemplateId"
          placeholder={contractTypeId ? "Select template" : "Select a contract type first"}
          disabled={!contractTypeId}
          options={templateOptions}
        />
      </LabeledField>

      <LabeledField label="Contract Number" error={errors.contractNumber?.message}>
        <Input {...register("contractNumber")} />
      </LabeledField>

      <LabeledField label="Contract Date" error={errors.contractDate?.message}>
        <Input type="date" {...register("contractDate")} />
      </LabeledField>

      <LabeledField label="Start Date" error={errors.startDate?.message}>
        <Input type="date" {...register("startDate")} />
      </LabeledField>

      <LabeledField label="End Date (Optional)" error={errors.endDate?.message}>
        <Input type="date" {...register("endDate")} />
      </LabeledField>

      <LabeledField label="Salary Basis" error={errors.salaryBasis?.message}>
        <SelectField
          control={control}
          name="salaryBasis"
          placeholder="Select salary basis"
          options={[
            { value: "MONTHLY", label: "Monthly" },
            { value: "HOURLY", label: "Hourly" },
          ]}
        />
      </LabeledField>

      <LabeledField label="Salary" error={errors.salary?.message}>
        <Input {...register("salary")} placeholder="e.g. 15000" />
      </LabeledField>

      <LabeledField label="Salary Currency" error={errors.salaryCurrency?.message}>
        <Input {...register("salaryCurrency")} placeholder="EGP" />
      </LabeledField>

      <LabeledField label="Hourly Rate (Optional)" error={errors.hourlyRate?.message}>
        <Input {...register("hourlyRate")} placeholder="e.g. 150" />
      </LabeledField>

      <LabeledField label="Max Monthly Hours (Optional)" error={errors.maxMonthlyHours?.message}>
        <Input {...register("maxMonthlyHours")} />
      </LabeledField>

      <LabeledField label="Working Hours / Week" error={errors.workingHoursPerWeek?.message}>
        <Input {...register("workingHoursPerWeek")} />
      </LabeledField>

      <LabeledField label="Working Hours / Month" error={errors.workingHoursPerMonth?.message}>
        <Input {...register("workingHoursPerMonth")} />
      </LabeledField>

      <LabeledField
        label="Probation Period (Days)"
        error={errors.probationPeriodDays?.message}
      >
        <Input {...register("probationPeriodDays")} />
      </LabeledField>

      <LabeledField label="Notice Period (Days)" error={errors.noticePeriodDays?.message}>
        <Input {...register("noticePeriodDays")} />
      </LabeledField>

      <LabeledField label="Work Type">
        <BooleanSelectField
          value={fulltime}
          onChange={(checked) => setValue("fulltime", checked)}
          trueLabel="Full Time"
          falseLabel="Part Time"
        />
      </LabeledField>

      <LabeledField label="Project Name (Optional)">
        <Input {...register("projectName")} />
      </LabeledField>

      <LabeledField label="External Employer (Optional)">
        <Input {...register("externalEmployerName")} />
      </LabeledField>

      <LabeledField label="External Leave Start (Optional)">
        <Input type="date" {...register("externalLeaveStartDate")} />
      </LabeledField>

      <LabeledField label="External Leave End (Optional)">
        <Input type="date" {...register("externalLeaveEndDate")} />
      </LabeledField>

      <div className="sm:col-span-2">
        <LabeledField label="Notes (Optional)">
          <textarea
            {...register("notes")}
            rows={3}
            className="flex w-full rounded-md border border-input bg-[#f4f6f9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Contract notes"
          />
        </LabeledField>
      </div>
    </div>
  );
}

export function ContractFormDialog({
  open,
  onOpenChange,
  employeeId,
  contract,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  contract?: ContractDetail;
}) {
  const isEdit = contract != null;
  const types = useContractTypes();
  const templates = useContractTemplates();
  const createContract = useCreateContract(employeeId);
  const updateContract = useUpdateContract(employeeId, contract?.contractId ?? 0);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: contractToFormValues(contract),
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

    reset(contractToFormValues(contract));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contract]);

  const isPending = createContract.isPending || updateContract.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      const request = toContractRequest(values);

      if (isEdit) {
        await updateContract.mutateAsync(request);
        toast.success("Contract updated");
      } else {
        await createContract.mutateAsync(request);
        toast.success("Contract created");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save contract",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl gap-0 overflow-hidden p-0 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {isEdit ? "Edit Contract" : "New Contract"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? `Update contract #${contract?.contractNumber ?? contract?.contractId}.`
              : "Create a new employment contract for this employee."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="px-6 py-5">
            <ContractFieldsGrid
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
              fulltime={fulltime}
              contractTypeId={contractTypeId}
              typeOptions={
                types.data?.map((type) => ({
                  value: String(type.id),
                  label: type.name,
                })) ?? []
              }
              templateOptions={templateOptions}
            />
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
