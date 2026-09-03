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
  useCreateEmployeeStatus,
  useUpdateEmployeeStatus,
} from "@/features/hr/hr-settings/api/use-employee-statuses";
import {
  employeeStatusSchema,
  employeeStatusToFormValues,
  toEmployeeStatusRequest,
  type EmployeeStatusFormValues,
} from "@/features/hr/hr-settings/schemas/employee-status-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { EmployeeStatusSetting } from "@/lib/api/generated/model";

export function EmployeeStatusFormDialog({
  open,
  onOpenChange,
  status,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: EmployeeStatusSetting;
}) {
  const { t } = useTranslation();
  const editMode = status != null;
  const employeeStatusId = status?.employeeStatusId ?? 0;
  const cannotDeactivate = editMode && (status?.usageCount ?? 0) > 0;
  const createStatus = useCreateEmployeeStatus();
  const updateStatus = useUpdateEmployeeStatus(employeeStatusId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeStatusFormValues>({
    resolver: zodResolver(employeeStatusSchema),
    defaultValues: employeeStatusToFormValues(status),
  });

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(employeeStatusToFormValues(status));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status]);

  const pending = createStatus.isPending || updateStatus.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateStatus.mutateAsync(toEmployeeStatusRequest(values));
        toast.success(t("hrSettings.forms.employeeStatus.editSuccess"));
      } else {
        await createStatus.mutateAsync(toEmployeeStatusRequest(values));
        toast.success(t("hrSettings.forms.employeeStatus.addSuccess"));
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("hrSettings.forms.employeeStatus.saveError"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode
              ? t("hrSettings.forms.employeeStatus.editTitle")
              : t("hrSettings.forms.employeeStatus.addTitle")}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? t("hrSettings.forms.employeeStatus.editDescription", { code: status.code })
              : t("hrSettings.forms.employeeStatus.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("hrSettings.forms.common.code")} error={errors.code?.message}>
              <Input
                {...register("code")}
                placeholder={t("hrSettings.forms.employeeStatus.codePlaceholder")}
                maxLength={50}
                disabled={editMode}
              />

              {editMode && (
                <p className="mt-1 text-xs text-gray-400">
                  {t("hrSettings.forms.common.codeImmutable")}
                </p>
              )}
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
                    {t("hrSettings.forms.employeeStatus.cannotDeactivateHint", {
                      count: status?.usageCount ?? 0,
                    })}
                  </p>
                )}
              </div>
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.nameEn")} error={errors.nameEn?.message}>
              <Input {...register("nameEn")} maxLength={100} />
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.nameAr")} error={errors.nameAr?.message}>
             <Input {...register("nameAr")} maxLength={100} dir="rtl" />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField
                label={t("hrSettings.forms.common.descriptionOptional")}
                error={errors.description?.message}
              >
                <Input {...register("description")} maxLength={255} />
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
                  ? t("hrSettings.forms.employeeStatus.saveChanges")
                  : t("hrSettings.forms.employeeStatus.addSubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
