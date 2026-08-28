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
import {
  useCreateContractTypeSetting,
  useUpdateContractTypeSetting,
} from "@/features/hr/hr-settings/api/use-contract-types";
import {
  contractTypeSchema,
  contractTypeToFormValues,
  toContractTypeRequest,
  type ContractTypeFormValues,
} from "@/features/hr/hr-settings/schemas/contract-type-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { ContractTypeSetting } from "@/lib/api/generated/model";

export function ContractTypeFormDialog({
  open,
  onOpenChange,
  contractType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType?: ContractTypeSetting;
}) {
  const editMode = contractType != null;
  const contractTypeId = contractType?.contractTypeId ?? 0;

  const createType = useCreateContractTypeSetting();
  const updateType = useUpdateContractTypeSetting(contractTypeId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContractTypeFormValues>({
    resolver: zodResolver(contractTypeSchema),
    defaultValues: contractTypeToFormValues(contractType),
  });

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(contractTypeToFormValues(contractType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contractType]);

  const pending = createType.isPending || updateType.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateType.mutateAsync(toContractTypeRequest(values));
        toast.success("Contract type updated successfully");
      } else {
        await createType.mutateAsync(toContractTypeRequest(values));
        toast.success("Contract type added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save contract type",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode ? "Edit Contract Type" : "Add Contract Type"}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? `Update the details for ${contractType.code}.`
              : "Create a new contract type."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label="Code" error={errors.code?.message}>
              <Input
                {...register("code")}
                placeholder="PERM"
                maxLength={50}
                disabled={editMode}
              />

              {editMode && (
                <p className="mt-1 text-xs text-gray-400">
                  Code cannot be changed after creation.
                </p>
              )}
            </LabeledField>
            <LabeledField label="Name" error={errors.name?.message}>
              <Input {...register("name")} maxLength={100} />{" "}
            </LabeledField>

            <LabeledField label="Status">
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField
                label="Description (Optional)"
                error={errors.description?.message}
              >
                <Input {...register("description")} maxLength={1000} />{" "}
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editMode ? "Save Changes" : "Add Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
