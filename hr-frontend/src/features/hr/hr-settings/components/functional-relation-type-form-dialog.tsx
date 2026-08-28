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
  const cannotDeactivate = editMode && (relationType?.usageCount ?? 0) > 0;

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
            {editMode
              ? "Edit Functional Relation Type"
              : "Add Functional Relation Type"}
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
              <Input
                {...register("code")}
                placeholder="TEAM_LEADER"
                maxLength={50}
                disabled={editMode}
              />

              {editMode && (
                <p className="mt-1 text-xs text-gray-400">
                  Code cannot be changed after creation.
                </p>
              )}
            </LabeledField>

            <LabeledField label="Name (English)" error={errors.nameEn?.message}>
              <Input {...register("nameEn")} maxLength={100} />
            </LabeledField>

            <LabeledField label="Name (Arabic)" error={errors.nameAr?.message}>
              <Input {...register("nameAr")} maxLength={100} dir="rtl" />
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
              <div>
                <StatusSelectField
                  active={active}
                  disableInactive={cannotDeactivate}
                  onChange={(checked) =>
                    setValue("active", checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />

                {cannotDeactivate && (
                  <p className="mt-1 text-xs leading-5 text-amber-600">
                    This relation type is used by{" "}
                    {relationType?.usageCount ?? 0}
                    active assignment(s) and cannot be deactivated.
                  </p>
                )}
              </div>
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField
                label="Description (Optional)"
                error={errors.description?.message}
              >
                <Input {...register("description")} maxLength={1000} />
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
