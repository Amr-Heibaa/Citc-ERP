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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateOrganizationChildUnit,
  useCreateOrganizationUnit,
  useOrganizationUnits,
  useOrganizationUnitTypes,
  useUpdateOrganizationUnit,
} from "@/features/hr/organizations/api/use-organization-units";
import {
  organizationUnitToFormValues,
  toCreateOrganizationUnitRequest,
  toUpdateOrganizationUnitRequest,
} from "@/features/hr/organizations/schemas/organization-unit-mappers";
import {
  organizationUnitSchema,
  ROOT_UNIT_VALUE,
  type OrganizationUnitFormValues,
} from "@/features/hr/organizations/schemas/organization-unit-schema";
import { DialogDecoration } from "@/features/hr/shared/components/dialog-decoration";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { OrganizationUnitDetail } from "@/lib/api/generated/model";

export function OrganizationUnitFormDialog({
  open,
  onOpenChange,
  organizationId,
  mode,
  unit,
  fixedParentUnitId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
  mode: "create" | "edit";
  unit?: OrganizationUnitDetail;
  fixedParentUnitId?: number;
}) {
  const { t } = useTranslation();
  const unitId = unit?.id ?? 0;

  const unitTypes = useOrganizationUnitTypes(open);

  const organizationUnits = useOrganizationUnits(organizationId, open);

  const createUnit = useCreateOrganizationUnit(organizationId);

  const createChildUnit = useCreateOrganizationChildUnit(
    organizationId,
    fixedParentUnitId ?? 0,
  );

  const updateUnitMutation = useUpdateOrganizationUnit(
    organizationId,
    unitId,
    unit?.parentUnitId,
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema),
    defaultValues: organizationUnitToFormValues(unit, fixedParentUnitId),
  });

  const active = useWatch({
    control,
    name: "active",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(organizationUnitToFormValues(unit, fixedParentUnitId));
  }, [fixedParentUnitId, open, reset, unit]);

  const pending =
    createUnit.isPending ||
    createChildUnit.isPending ||
    updateUnitMutation.isPending;

  const title =
    mode === "edit"
      ? t("organizations.unitForm.editTitle")
      : fixedParentUnitId != null
        ? t("organizations.unitForm.addChildTitle")
        : t("organizations.unitForm.addTitle");

  const submitLabel =
    mode === "edit"
      ? t("organizations.unitForm.saveChanges")
      : fixedParentUnitId != null
        ? t("organizations.unitForm.addChildTitle")
        : t("organizations.unitForm.addTitle");

  const submit = handleSubmit(async (values) => {
    try {
      if (mode === "edit") {
        await updateUnitMutation.mutateAsync(
          toUpdateOrganizationUnitRequest(values),
        );

        toast.success(t("organizations.unitForm.editSuccess"));
      } else if (fixedParentUnitId != null) {
        await createChildUnit.mutateAsync(
          toCreateOrganizationUnitRequest({
            ...values,
            parentOrgUnitId: String(fixedParentUnitId),
          }),
        );

        toast.success(t("organizations.unitForm.addChildSuccess"));
      } else {
        await createUnit.mutateAsync(toCreateOrganizationUnitRequest(values));

        toast.success(t("organizations.unitForm.addSuccess"));
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("organizations.unitForm.saveError"),
      );
    }
  });

  const typeOptions =
    unitTypes.data?.flatMap((type) =>
      type.id == null
        ? []
        : [
            {
              value: String(type.id),
              label: type.nameEn ?? type.code,
            },
          ],
    ) ?? [];

  const parentOptions = [
    {
      value: ROOT_UNIT_VALUE,
      label: t("organizations.unitForm.noParentRootUnit"),
    },

    ...(organizationUnits.data?.flatMap((candidate) => {
      if (candidate.id == null || candidate.id === unitId) {
        return [];
      }

      return [
        {
          value: String(candidate.id),
          label: candidate.name ?? candidate.code,
        },
      ];
    }) ?? []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] sm:max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">{title}</DialogTitle>

          <DialogDescription>
            {t("organizations.unitForm.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex min-h-0 flex-1 overflow-y-auto">
            <div className="grid flex-1 grid-cols-1 content-start gap-5 px-6 py-5 md:grid-cols-2">
              <LabeledField
                label={t("organizations.unitForm.parentUnit")}
                error={errors.parentOrgUnitId?.message}
              >
                <SelectField
                  control={control}
                  name="parentOrgUnitId"
                  placeholder={t("organizations.unitForm.selectParentUnit")}
                  options={parentOptions}
                  disabled={fixedParentUnitId != null}
                />
              </LabeledField>

              <LabeledField label={t("organizations.unitForm.unitType")} error={errors.unitTypeId?.message}>
                <SelectField
                  control={control}
                  name="unitTypeId"
                  placeholder={t("organizations.unitForm.selectUnitType")}
                  options={typeOptions}
                />
              </LabeledField>

              <LabeledField label={t("organizations.unitForm.unitCode")} error={errors.code?.message}>
                <Input {...register("code")} />
              </LabeledField>

              <div aria-hidden />

              <LabeledField label={t("organizations.unitForm.nameEn")} error={errors.nameEn?.message}>
                <Input {...register("nameEn")} />
              </LabeledField>

              <LabeledField label={t("organizations.unitForm.nameAr")} error={errors.nameAr?.message}>
                <Input {...register("nameAr")} dir="rtl" />
              </LabeledField>

              <LabeledField label={t("organizations.unitForm.startDate")} error={errors.startDate?.message}>
                <Input type="date" {...register("startDate")} />
              </LabeledField>

              <LabeledField label={t("common.description")}>
                <Textarea {...register("description")} rows={4} />
              </LabeledField>

              <LabeledField label={t("common.status")}>
                <StatusSelectField
                  active={active}
                  onChange={(checked) => setValue("active", checked)}
                />
              </LabeledField>

              <div aria-hidden />
            </div>

            <div className="hidden w-[240px] shrink-0 items-center justify-center md:flex">
              <DialogDecoration className="h-full w-full" />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? t("organizations.form.saving") : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
