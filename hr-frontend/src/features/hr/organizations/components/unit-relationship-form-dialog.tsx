import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  useForm,
  useWatch,
} from "react-hook-form";
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
  useCreateOrganizationUnitRelationship,
  useOrganizationRelationTypes,
  useOrganizationUnits,
  useUpdateOrganizationUnitRelationship,
} from "@/features/hr/organizations/api/use-organization-units";
import {
  relationshipToFormValues,
  toCreateUnitRelationshipRequest,
  toUpdateUnitRelationshipRequest,
} from "@/features/hr/organizations/schemas/unit-relationship-mappers";
import {
  unitRelationshipSchema,
  type UnitRelationshipFormValues,
} from "@/features/hr/organizations/schemas/unit-relationship-schema";
import { DialogDecoration } from "@/features/hr/shared/components/dialog-decoration";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { UnitRelationship } from "@/lib/api/generated/model";

export function UnitRelationshipFormDialog({
  open,
  onOpenChange,
  organizationId,
  orgUnitId,
  relationship,
}: {
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
  organizationId: number;
  orgUnitId: number;
  relationship?: UnitRelationship;
}) {
  const { t } = useTranslation();
  const relationId =
    relationship?.id ?? 0;

  const editMode =
    relationship != null;

  const organizationUnits =
    useOrganizationUnits(
      organizationId,
    );

  const relationTypes =
    useOrganizationRelationTypes();

  const createRelationship =
    useCreateOrganizationUnitRelationship(
      orgUnitId,
    );

  const updateRelationship =
    useUpdateOrganizationUnitRelationship(
      orgUnitId,
      relationId,
    );

  const {
    control,
    register,
    reset,
    handleSubmit,
    setValue,
    formState: {
      errors,
    },
  } =
    useForm<UnitRelationshipFormValues>({
      resolver: zodResolver(
        unitRelationshipSchema,
      ),
      defaultValues:
        relationshipToFormValues(
          orgUnitId,
          relationship,
        ),
    });

  const active = useWatch({
    control,
    name: "active",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      relationshipToFormValues(
        orgUnitId,
        relationship,
      ),
    );
  }, [
    open,
    orgUnitId,
    relationship,
    reset,
  ]);

  const pending =
    createRelationship.isPending ||
    updateRelationship.isPending;

  const unitOptions =
    organizationUnits.data?.flatMap(
      (unit) =>
        unit.id == null
          ? []
          : [{
              value: String(
                unit.id,
              ),
              label:
                unit.name ??
                unit.code,
            }],
    ) ?? [];

  const relationTypeOptions =
    relationTypes.data?.flatMap(
      (type) =>
        type.id == null
          ? []
          : [{
              value: String(
                type.id,
              ),
              label:
                type.nameEn ??
                type.code,
            }],
    ) ?? [];

  const submit =
    handleSubmit(
      async (values) => {
        try {
          if (editMode) {
            await updateRelationship.mutateAsync(
              toUpdateUnitRelationshipRequest(
                values,
              ),
            );

            toast.success(
              t("organizations.unitRelationshipForm.editSuccess"),
            );
          } else {
            await createRelationship.mutateAsync(
              toCreateUnitRelationshipRequest(
                values,
              ),
            );

            toast.success(
              t("organizations.unitRelationshipForm.addSuccess"),
            );
          }

          onOpenChange(false);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : t("organizations.unitRelationshipForm.saveError"),
          );
        }
      },
    );

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="flex max-h-[92vh] sm:max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode
              ? t("organizations.unitRelationshipForm.editTitle")
              : t("organizations.unitRelationshipForm.addTitle")}
          </DialogTitle>

          <DialogDescription>
            {t("organizations.unitRelationshipForm.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 overflow-y-auto">
            <div className="grid flex-1 grid-cols-1 content-start gap-5 px-6 py-5 md:grid-cols-2">
              <LabeledField
                label={t("organizations.unitRelationshipForm.fromUnit")}
                error={
                  errors
                    .fromUnitId
                    ?.message
                }
              >
                <SelectField
                  control={control}
                  name="fromUnitId"
                  placeholder={t("organizations.unitRelationshipForm.selectFromUnit")}
                  options={
                    unitOptions
                  }
                />
              </LabeledField>

              <LabeledField
                label={t("organizations.unitRelationshipForm.relationshipType")}
                error={
                  errors
                    .relationTypeId
                    ?.message
                }
              >
                <SelectField
                  control={control}
                  name="relationTypeId"
                  placeholder={t("organizations.unitRelationshipForm.selectRelationshipType")}
                  options={
                    relationTypeOptions
                  }
                />
              </LabeledField>

              <LabeledField
                label={t("organizations.unitRelationshipForm.toUnit")}
                error={
                  errors
                    .toUnitId
                    ?.message
                }
              >
                <SelectField
                  control={control}
                  name="toUnitId"
                  placeholder={t("organizations.unitRelationshipForm.selectToUnit")}
                  options={
                    unitOptions
                  }
                />
              </LabeledField>

              <LabeledField label={t("common.status")}>
                <StatusSelectField
                  active={active}
                  onChange={(checked) =>
                    setValue(
                      "active",
                      checked,
                    )
                  }
                />
              </LabeledField>

              <LabeledField
                label={t("organizations.unitRelationshipForm.startDate")}
                error={
                  errors
                    .startDate
                    ?.message
                }
              >
                <Input
                  type="date"
                  {...register(
                    "startDate",
                  )}
                />
              </LabeledField>

              <LabeledField
                label={t("organizations.unitRelationshipForm.endDate")}
                error={
                  errors
                    .endDate
                    ?.message
                }
              >
                <Input
                  type="date"
                  {...register(
                    "endDate",
                  )}
                />
              </LabeledField>
            </div>

            <div className="hidden w-[240px] shrink-0 items-center justify-center md:flex">
              <DialogDecoration className="h-full w-full" />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              disabled={pending}
            >
              {pending
                ? t("organizations.form.saving")
                : editMode
                  ? t("organizations.unitForm.saveChanges")
                  : t("organizations.unitOverview.addRelationship")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}