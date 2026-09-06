import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        toast.success(t("hrSettings.forms.functionalRelationType.editSuccess"));
      } else {
        await createType.mutateAsync(toFunctionalRelationTypeRequest(values));
        toast.success(t("hrSettings.forms.functionalRelationType.addSuccess"));
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("hrSettings.forms.functionalRelationType.saveError"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode
              ? t("hrSettings.forms.functionalRelationType.editTitle")
              : t("hrSettings.forms.functionalRelationType.addTitle")}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? t("hrSettings.forms.functionalRelationType.editDescription", {
                  code: relationType.code,
                })
              : t("hrSettings.forms.functionalRelationType.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("hrSettings.forms.common.code")} error={errors.code?.message}>
              <Input
                {...register("code")}
                placeholder={t("hrSettings.forms.functionalRelationType.codePlaceholder")}
                maxLength={50}
                disabled={editMode}
              />

              {editMode && (
                <p className="mt-1 text-xs text-gray-400">
                  {t("hrSettings.forms.common.codeImmutable")}
                </p>
              )}
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.nameEn")} error={errors.nameEn?.message}>
              <Input {...register("nameEn")} maxLength={100} />
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.nameAr")} error={errors.nameAr?.message}>
              <Input {...register("nameAr")} maxLength={100} dir="rtl" />
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.functionalRelationType.approvalRelation")}>
              <BooleanSelectField
                value={approvalRelation}
                onChange={(checked) => setValue("approvalRelation", checked)}
                trueLabel={t("common.yes")}
                falseLabel={t("common.no")}
              />
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.status")}>
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
                    {t("hrSettings.forms.functionalRelationType.cannotDeactivateHint", {
                      count: relationType?.usageCount ?? 0,
                    })}
                  </p>
                )}
              </div>
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField
                label={t("hrSettings.forms.common.descriptionOptional")}
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
              {t("hrSettings.forms.common.cancel")}
            </Button>

            <Button type="submit" disabled={pending}>
              {pending
                ? t("hrSettings.forms.common.saving")
                : editMode
                  ? t("hrSettings.forms.functionalRelationType.saveChanges")
                  : t("hrSettings.forms.functionalRelationType.addSubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
