import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { useRenewContract } from "@/features/hr/employees/api/use-contracts";
import {
  contractSchema,
  toContractRequest,
  type ContractFormValues,
} from "@/features/hr/employees/schemas/contract-schema";
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
  const types = useContractTypes();
  const renewContract = useRenewContract(employeeId, contract.contractId ?? 0);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractTypeId: contract.contractTypeId != null ? String(contract.contractTypeId) : "",
      contractNumber: "",
      startDate: "",
      endDate: "",
      salary: contract.salary != null ? String(contract.salary) : "",
      salaryCurrency: contract.salaryCurrency ?? "EGP",
      workingHoursPerWeek:
        contract.workingHoursPerWeek != null ? String(contract.workingHoursPerWeek) : "",
      workingHoursPerMonth:
        contract.workingHoursPerMonth != null ? String(contract.workingHoursPerMonth) : "",
      probationPeriodDays: "",
      fulltime: contract.fulltime ?? true,
      notes: "",
    },
  });

  const fulltime = useWatch({ control, name: "fulltime" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      contractTypeId: contract.contractTypeId != null ? String(contract.contractTypeId) : "",
      contractNumber: "",
      startDate: "",
      endDate: "",
      salary: contract.salary != null ? String(contract.salary) : "",
      salaryCurrency: contract.salaryCurrency ?? "EGP",
      workingHoursPerWeek:
        contract.workingHoursPerWeek != null ? String(contract.workingHoursPerWeek) : "",
      workingHoursPerMonth:
        contract.workingHoursPerMonth != null ? String(contract.workingHoursPerMonth) : "",
      probationPeriodDays: "",
      fulltime: contract.fulltime ?? true,
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contract]);

  const submit = handleSubmit(async (values) => {
    try {
      await renewContract.mutateAsync(toContractRequest(values));
      toast.success("Contract renewed");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to renew contract",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">Renew Contract</DialogTitle>

          <DialogDescription>
            Ends contract #{contract.contractNumber ?? contract.contractId} the day
            before the new contract starts, and creates the renewed contract below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label="Contract Type" error={errors.contractTypeId?.message}>
              <SelectField
                control={control}
                name="contractTypeId"
                placeholder="Select type"
                options={
                  types.data?.map((type) => ({
                    value: String(type.id),
                    label: type.name,
                  })) ?? []
                }
              />
            </LabeledField>

            <LabeledField
              label="New Contract Number"
              error={errors.contractNumber?.message}
            >
              <Input {...register("contractNumber")} />
            </LabeledField>

            <LabeledField label="Start Date" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </LabeledField>

            <LabeledField label="End Date (Optional)" error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </LabeledField>

            <LabeledField label="Salary" error={errors.salary?.message}>
              <Input {...register("salary")} placeholder="e.g. 15000" />
            </LabeledField>

            <LabeledField
              label="Salary Currency"
              error={errors.salaryCurrency?.message}
            >
              <Input {...register("salaryCurrency")} placeholder="EGP" />
            </LabeledField>

            <LabeledField
              label="Working Hours / Week"
              error={errors.workingHoursPerWeek?.message}
            >
              <Input {...register("workingHoursPerWeek")} />
            </LabeledField>

            <LabeledField
              label="Working Hours / Month"
              error={errors.workingHoursPerMonth?.message}
            >
              <Input {...register("workingHoursPerMonth")} />
            </LabeledField>

            <LabeledField
              label="Probation Period (Days)"
              error={errors.probationPeriodDays?.message}
            >
              <Input {...register("probationPeriodDays")} />
            </LabeledField>

            <LabeledField label="Work Type">
              <BooleanSelectField
                value={fulltime}
                onChange={(checked) => setValue("fulltime", checked)}
                trueLabel="Full Time"
                falseLabel="Part Time"
              />
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

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={renewContract.isPending}>
              {renewContract.isPending ? "Saving…" : "Renew Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
