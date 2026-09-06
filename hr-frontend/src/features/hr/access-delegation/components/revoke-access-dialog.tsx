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
import { useRevokeHrAccess } from "@/features/hr/access-delegation/api/use-hr-access";
import {
  reasonSchema,
  type ReasonFormValues,
} from "@/features/hr/employees/schemas/employee-lifecycle-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import type { HrAccessGrantView } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: ReasonFormValues = { reason: "" };

export function RevokeAccessDialog({
  open,
  onOpenChange,
  grant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grant: HrAccessGrantView;
}) {
  const { t } = useTranslation();
  const revokeAccess = useRevokeHrAccess(grant.hrAccessGrantId ?? 0);

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
      await revokeAccess.mutateAsync({ reason: values.reason });
      toast.success(t("accessDelegation.revokedSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("accessDelegation.unableToRevoke"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {t("accessDelegation.revokeDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("accessDelegation.revokeDialog.description", { name: grant.displayName ?? "" })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="px-6 py-5">
            <LabeledField label={t("common.reason")} error={errors.reason?.message}>
              <Input
                {...register("reason")}
                placeholder={t("accessDelegation.revokeDialog.reasonPlaceholder")}
                autoFocus
              />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>

            <Button type="submit" variant="destructive" disabled={revokeAccess.isPending}>
              {revokeAccess.isPending
                ? t("accessDelegation.revokeDialog.revoking")
                : t("accessDelegation.revoke")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
