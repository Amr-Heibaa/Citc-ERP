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
              "Relationship updated successfully",
            );
          } else {
            await createRelationship.mutateAsync(
              toCreateUnitRelationshipRequest(
                values,
              ),
            );

            toast.success(
              "Relationship added successfully",
            );
          }

          onOpenChange(false);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to save relationship",
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
              ? "Edit Relationship"
              : "Add Relationship"}
          </DialogTitle>

          <DialogDescription>
            Define the relationship
            between two organization
            units.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 overflow-y-auto">
            <div className="grid flex-1 grid-cols-1 content-start gap-5 px-6 py-5 md:grid-cols-2">
              <LabeledField
                label="From Unit"
                error={
                  errors
                    .fromUnitId
                    ?.message
                }
              >
                <SelectField
                  control={control}
                  name="fromUnitId"
                  placeholder="Select from unit"
                  options={
                    unitOptions
                  }
                />
              </LabeledField>

              <LabeledField
                label="Relationship Type"
                error={
                  errors
                    .relationTypeId
                    ?.message
                }
              >
                <SelectField
                  control={control}
                  name="relationTypeId"
                  placeholder="Select relationship type"
                  options={
                    relationTypeOptions
                  }
                />
              </LabeledField>

              <LabeledField
                label="To Unit"
                error={
                  errors
                    .toUnitId
                    ?.message
                }
              >
                <SelectField
                  control={control}
                  name="toUnitId"
                  placeholder="Select to unit"
                  options={
                    unitOptions
                  }
                />
              </LabeledField>

              <LabeledField label="Status">
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
            </div>

            <div className="hidden w-[220px] shrink-0 items-center justify-center border-l border-gray-100 md:flex">
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
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={pending}
            >
              {pending
                ? "Saving…"
                : editMode
                  ? "Save Changes"
                  : "Add Relationship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}