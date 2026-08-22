import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  useForm,
  useWatch,
} from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
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
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
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
  onOpenChange: (
    open: boolean,
  ) => void;
  organizationId: number;
  mode: "create" | "edit";
  unit?: OrganizationUnitDetail;
  fixedParentUnitId?: number;
}) {
  const unitId =
    unit?.id ?? 0;

  const unitTypes =
    useOrganizationUnitTypes();

  const organizationUnits =
    useOrganizationUnits(
      organizationId,
    );

  const createUnit =
    useCreateOrganizationUnit(
      organizationId,
    );

  const createChildUnit =
    useCreateOrganizationChildUnit(
      organizationId,
      fixedParentUnitId ?? 0,
    );

  const updateUnitMutation =
    useUpdateOrganizationUnit(
      organizationId,
      unitId,
    );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: {
      errors,
    },
  } =
    useForm<OrganizationUnitFormValues>({
      resolver: zodResolver(
        organizationUnitSchema,
      ),
      defaultValues:
        organizationUnitToFormValues(
          unit,
          fixedParentUnitId,
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
      organizationUnitToFormValues(
        unit,
        fixedParentUnitId,
      ),
    );
  }, [
    fixedParentUnitId,
    open,
    reset,
    unit,
  ]);

  const pending =
    createUnit.isPending ||
    createChildUnit.isPending ||
    updateUnitMutation.isPending;

  const title =
    mode === "edit"
      ? "Edit Unit"
      : fixedParentUnitId != null
        ? "Add Child Unit"
        : "Add Unit";

  const submitLabel =
    mode === "edit"
      ? "Save Changes"
      : fixedParentUnitId != null
        ? "Add Child Unit"
        : "Add Unit";

  const submit =
    handleSubmit(
      async (values) => {
        try {
          if (
            mode === "edit"
          ) {
            await updateUnitMutation.mutateAsync(
              toUpdateOrganizationUnitRequest(
                values,
              ),
            );

            toast.success(
              "Unit updated successfully",
            );
          } else if (
            fixedParentUnitId !=
            null
          ) {
            await createChildUnit.mutateAsync(
              toCreateOrganizationUnitRequest(
                {
                  ...values,
                  parentOrgUnitId:
                    String(
                      fixedParentUnitId,
                    ),
                },
              ),
            );

            toast.success(
              "Child unit added successfully",
            );
          } else {
            await createUnit.mutateAsync(
              toCreateOrganizationUnitRequest(
                values,
              ),
            );

            toast.success(
              "Unit added successfully",
            );
          }

          onOpenChange(false);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to save unit",
          );
        }
      },
    );

  const typeOptions =
    unitTypes.data?.flatMap(
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

  const parentOptions = [
    {
      value: ROOT_UNIT_VALUE,
      label:
        "No parent (root unit)",
    },

    ...(organizationUnits.data?.flatMap(
      (candidate) => {
        if (
          candidate.id == null ||
          candidate.id ===
            unitId
        ) {
          return [];
        }

        return [{
          value: String(
            candidate.id,
          ),
          label:
            candidate.name ??
            candidate.code,
        }];
      },
    ) ?? []),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {title}
          </DialogTitle>

          <DialogDescription>
            Enter the organization
            unit information.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto px-6 py-5 md:grid-cols-2">
            <LabeledField
              label="Unit Code"
              error={
                errors.code?.message
              }
            >
              <Input
                {...register(
                  "code",
                )}
              />
            </LabeledField>

            <LabeledField
              label="Unit Type"
              error={
                errors
                  .unitTypeId
                  ?.message
              }
            >
              <SelectField
                control={control}
                name="unitTypeId"
                placeholder="Select unit type"
                options={
                  typeOptions
                }
              />
            </LabeledField>

            <LabeledField
              label="Name (English)"
              error={
                errors
                  .nameEn
                  ?.message
              }
            >
              <Input
                {...register(
                  "nameEn",
                )}
              />
            </LabeledField>

            <LabeledField
              label="Name (Arabic)"
              error={
                errors
                  .nameAr
                  ?.message
              }
            >
              <Input
                {...register(
                  "nameAr",
                )}
                dir="rtl"
              />
            </LabeledField>

            <LabeledField
              label="Parent Unit"
              error={
                errors
                  .parentOrgUnitId
                  ?.message
              }
            >
              <SelectField
                control={control}
                name="parentOrgUnitId"
                placeholder="Select parent unit"
                options={
                  parentOptions
                }
                disabled={
                  fixedParentUnitId !=
                  null
                }
              />
            </LabeledField>

            <LabeledField label="Status">
              <div className="flex h-10 items-center gap-3">
                <Switch
                  checked={active}
                  onCheckedChange={(
                    checked,
                  ) =>
                    setValue(
                      "active",
                      checked,
                    )
                  }
                />

                <span className="text-sm text-gray-600">
                  {active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </LabeledField>

            <LabeledField
              label="Start Date"
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
              label="End Date"
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

            <LabeledField label="Description">
              <Textarea
                {...register(
                  "description",
                )}
                rows={4}
              />
            </LabeledField>

            <LabeledField label="Description (Arabic)">
              <Textarea
                {...register(
                  "descriptionAr",
                )}
                rows={4}
                dir="rtl"
              />
            </LabeledField>
          </div>

          <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={pending}
            >
              {pending
                ? "Saving…"
                : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}