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
import { useDeleteEmployee } from "@/features/hr/employees/api/use-employees";
import {
  reasonSchema,
  toDeleteEmployeeRequest,
  type ReasonFormValues,
} from "@/features/hr/employees/schemas/employee-lifecycle-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";

const EMPTY_DEFAULTS: ReasonFormValues = { reason: "" };

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  employeeName: string;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const deleteEmployee = useDeleteEmployee(employeeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_DEFAULTS);
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await deleteEmployee.mutateAsync(toDeleteEmployeeRequest(values));
      toast.success(t("employees.deleteDialog.deleted", { name: employeeName }));
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.deleteDialog.unableToDelete"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("employees.deleteDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.deleteDialog.description", { name: employeeName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="px-6 py-5">
            <LabeledField label={t("common.reason")} error={errors.reason?.message}>
              <Input
                {...register("reason")}
                placeholder={t("employees.deleteDialog.reasonPlaceholder")}
                autoFocus
              />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>

            <Button type="submit" variant="destructive" disabled={deleteEmployee.isPending}>
              {deleteEmployee.isPending ? t("employees.deleteDialog.deleting") : t("employees.deleteDialog.deleteEmployee")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
