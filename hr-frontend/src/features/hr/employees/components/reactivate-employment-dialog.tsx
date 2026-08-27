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
import { useOrganizations, useStatuses } from "@/features/hr/employees/api/use-employees";
import {
  usePositionsForEmployment,
  useReactivateEmployment,
} from "@/features/hr/employees/api/use-employment";
import {
  ASSIGNMENT_TYPE_OPTIONS,
  REACTIVATION_STATUS_CODES,
  reactivateSchema,
  toReactivateRequest,
  type ReactivateFormValues,
} from "@/features/hr/employees/schemas/employment-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import type { EmploymentOverview } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: ReactivateFormValues = {
  organizationId: "",
  employeeStatusId: "",
  positionId: "",
  assignmentType: "1",
  startDate: "",
  endDate: "",
  reason: "",
};

export function ReactivateEmploymentDialog({
  open,
  onOpenChange,
  overview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overview: EmploymentOverview;
}) {
  const employeeId = overview.employeeId ?? 0;
  const statuses = useStatuses();
  const organizations = useOrganizations();
  const reactivateEmployment = useReactivateEmployment(employeeId);

  const reactivationStatuses = (statuses.data ?? []).filter((status) =>
    REACTIVATION_STATUS_CODES.includes(status.code ?? ""),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReactivateFormValues>({
    resolver: zodResolver(reactivateSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  // A terminated employee has no current organization (it's cleared on
  // termination), so we can't scope the position picker to overview.organizationId
  // like other dialogs do — the admin picks the org fresh here instead.
  const organizationId = useWatch({ control, name: "organizationId" });
  const selectedOrgId = organizationId ? Number(organizationId) : undefined;
  const positions = usePositionsForEmployment(selectedOrgId);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      ...EMPTY_DEFAULTS,
      startDate: new Date().toISOString().slice(0, 10),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setValue("positionId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const submit = handleSubmit(async (values) => {
    try {
      await reactivateEmployment.mutateAsync(toReactivateRequest(values));
      toast.success("Employment reactivated");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to reactivate employment",
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            Reactivate Employment
          </DialogTitle>

          <DialogDescription>
            Rehire this employee into a position with a new assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LabeledField label="Organization">
                <SelectField
                  control={control}
                  name="organizationId"
                  placeholder="Select organization"
                  options={
                    organizations.data?.flatMap((organization) =>
                      organization.id == null
                        ? []
                        : [{ value: String(organization.id), label: organization.name }],
                    ) ?? []
                  }
                />
              </LabeledField>
            </div>

            <div className="sm:col-span-2">
              <LabeledField label="Position" error={errors.positionId?.message}>
                <SelectField
                  control={control}
                  name="positionId"
                  placeholder={selectedOrgId ? "Select position" : "Select an organization first"}
                  disabled={!selectedOrgId}
                  options={
                    positions.data?.content?.flatMap((position) =>
                      position.positionId == null
                        ? []
                        : [
                            {
                              value: String(position.positionId),
                              label: `${position.titleEn} (${position.code})`,
                            },
                          ],
                    ) ?? []
                  }
                />
              </LabeledField>
            </div>

            <LabeledField label="Status" error={errors.employeeStatusId?.message}>
              <SelectField
                control={control}
                name="employeeStatusId"
                placeholder="Select status"
                options={reactivationStatuses.map((status) => ({
                  value: String(status.id),
                  label: status.name,
                }))}
              />
            </LabeledField>

            <LabeledField
              label="Assignment Type"
              error={errors.assignmentType?.message}
            >
              <SelectField
                control={control}
                name="assignmentType"
                placeholder="Select type"
                options={ASSIGNMENT_TYPE_OPTIONS}
              />
            </LabeledField>

            <LabeledField label="Start Date" error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </LabeledField>

            <LabeledField label="End Date (Optional)" error={errors.endDate?.message}>
              <Input type="date" {...register("endDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label="Reason (Optional)">
                <Input {...register("reason")} placeholder="Reason for reactivation" />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={reactivateEmployment.isPending}>
              {reactivateEmployment.isPending ? "Saving…" : "Reactivate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
