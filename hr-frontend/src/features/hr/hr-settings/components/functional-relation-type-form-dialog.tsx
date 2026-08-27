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
  useCreateFunctionalRelationType,
  useUpdateFunctionalRelationType,
} from "@/features/hr/hr-settings/api/use-functional-relation-types";
import {
  functionalRelationTypeSchema,
  functionalRelationTypeToFormValues,
  toFunctionalRelationTypeRequest,
  type FunctionalRelationTypeFormValues,
} from "@/features/hr/hr-settings/schemas/functional-relation-type-schema";
import { BooleanSelectField } from "@/features/hr/shared/components/boolean-select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { FunctionalRelationTypeSetting } from "@/lib/api/generated/model";

export function FunctionalRelationTypeFormDialog({
  open,
  onOpenChange,
  relationType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationType?: FunctionalRelationTypeSetting;
}) {
  const editMode = relationType != null;
  const functionalRelationTypeId = relationType?.functionalRelationTypeId ?? 0;

  const createType = useCreateFunctionalRelationType();
  const updateType = useUpdateFunctionalRelationType(functionalRelationTypeId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FunctionalRelationTypeFormValues>({
    resolver: zodResolver(functionalRelationTypeSchema),
    defaultValues: functionalRelationTypeToFormValues(relationType),
  });

  const active = useWatch({ control, name: "active" });
  const approvalRelation = useWatch({ control, name: "approvalRelation" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(functionalRelationTypeToFormValues(relationType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, relationType]);

  const pending = createType.isPending || updateType.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateType.mutateAsync(toFunctionalRelationTypeRequest(values));
        toast.success("Functional relation type updated successfully");
      } else {
        await createType.mutateAsync(toFunctionalRelationTypeRequest(values));
        toast.success("Functional relation type added successfully");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save functional relation type",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode ? "Edit Functional Relation Type" : "Add Functional Relation Type"}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? `Update the details for ${relationType.code}.`
              : "Create a new functional relation type."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label="Code" error={errors.code?.message}>
              <Input {...register("code")} placeholder="TEAM_LEADER" />
            </LabeledField>

            <LabeledField label="Name (English)" error={errors.nameEn?.message}>
              <Input {...register("nameEn")} />
            </LabeledField>

            <LabeledField label="Name (Arabic)" error={errors.nameAr?.message}>
              <Input {...register("nameAr")} dir="rtl" />
            </LabeledField>

            <LabeledField label="Approval Relation">
              <BooleanSelectField
                value={approvalRelation}
                onChange={(checked) => setValue("approvalRelation", checked)}
                trueLabel="Yes"
                falseLabel="No"
              />
            </LabeledField>

            <LabeledField label="Status">
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label="Description (Optional)" error={errors.description?.message}>
                <Input {...register("description")} />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
