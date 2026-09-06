import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  useEmployeesForGrant,
  useGrantHrAccess,
} from "@/features/hr/access-delegation/api/use-hr-access";
import {
  grantAccessSchema,
  toGrantAccessRequest,
  type GrantAccessFormValues,
} from "@/features/hr/access-delegation/schemas/access-grant-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";

const EMPTY_DEFAULTS: GrantAccessFormValues = {
  userId: "",
  startDate: "",
  endDate: "",
  reason: "",
};

export function GrantAccessDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const employees = useEmployeesForGrant();
  const grantAccess = useGrantHrAccess();

  const eligibleEmployees = (employees.data ?? []).filter(
    (employee): employee is typeof employee & { userId: number } =>
      Number.isInteger(employee.userId),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GrantAccessFormValues>({
    resolver: zodResolver(grantAccessSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset({
        ...EMPTY_DEFAULTS,
        startDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await grantAccess.mutateAsync(toGrantAccessRequest(values));
      toast.success(t("accessDelegation.grantDialog.success"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("accessDelegation.grantDialog.error"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("accessDelegation.grantDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("accessDelegation.grantDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LabeledField label={t("accessDelegation.grantDialog.employee")} error={errors.userId?.message}>
                <SelectField
                  control={control}
                  name="userId"
                  placeholder={t("accessDelegation.grantDialog.selectEmployee")}
                  options={eligibleEmployees.map((employee) => ({
                    value: String(employee.userId),
                    label: `${employee.displayName ?? "—"} (${employee.employeeNumber ?? "—"})`,
                  }))}
                />
              </LabeledField>
            </div>

            <LabeledField label={t("accessDelegation.grantDialog.startDate")} error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} />
            </LabeledField>

            <LabeledField
              label={t("accessDelegation.grantDialog.endDateOptional")}
              error={errors.endDate?.message}
            >
              <Input type="date" {...register("endDate")} />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField label={t("accessDelegation.grantDialog.reason")} error={errors.reason?.message}>
                <Input
                  {...register("reason")}
                  placeholder={t("accessDelegation.grantDialog.reasonPlaceholder")}
                />
              </LabeledField>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("accessDelegation.grantDialog.cancel")}
            </Button>

            <Button type="submit" disabled={grantAccess.isPending}>
              {grantAccess.isPending
                ? t("accessDelegation.grantDialog.granting")
                : t("accessDelegation.grantDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
