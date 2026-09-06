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
  useCreateContractTypeSetting,
  useUpdateContractTypeSetting,
} from "@/features/hr/hr-settings/api/use-contract-types";
import {
  contractTypeSchema,
  contractTypeToFormValues,
  toContractTypeRequest,
  type ContractTypeFormValues,
} from "@/features/hr/hr-settings/schemas/contract-type-schema";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { ContractTypeSetting } from "@/lib/api/generated/model";

export function ContractTypeFormDialog({
  open,
  onOpenChange,
  contractType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType?: ContractTypeSetting;
}) {
  const { t } = useTranslation();
  const editMode = contractType != null;
  const contractTypeId = contractType?.contractTypeId ?? 0;

  const createType = useCreateContractTypeSetting();
  const updateType = useUpdateContractTypeSetting(contractTypeId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContractTypeFormValues>({
    resolver: zodResolver(contractTypeSchema),
    defaultValues: contractTypeToFormValues(contractType),
  });

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(contractTypeToFormValues(contractType));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contractType]);

  const pending = createType.isPending || updateType.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateType.mutateAsync(toContractTypeRequest(values));
        toast.success(t("hrSettings.forms.contractType.editSuccess"));
      } else {
        await createType.mutateAsync(toContractTypeRequest(values));
        toast.success(t("hrSettings.forms.contractType.addSuccess"));
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("hrSettings.forms.contractType.saveError"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode
              ? t("hrSettings.forms.contractType.editTitle")
              : t("hrSettings.forms.contractType.addTitle")}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? t("hrSettings.forms.contractType.editDescription", { code: contractType.code })
              : t("hrSettings.forms.contractType.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("hrSettings.forms.common.code")} error={errors.code?.message}>
              <Input
                {...register("code")}
                placeholder={t("hrSettings.forms.contractType.codePlaceholder")}
                maxLength={50}
                disabled={editMode}
              />

              {editMode && (
                <p className="mt-1 text-xs text-gray-400">
                  {t("hrSettings.forms.common.codeImmutable")}
                </p>
              )}
            </LabeledField>
            <LabeledField label={t("common.name")} error={errors.name?.message}>
              <Input {...register("name")} maxLength={100} />{" "}
            </LabeledField>

            <LabeledField label={t("hrSettings.forms.common.status")}>
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>

            <div className="sm:col-span-2">
              <LabeledField
                label={t("hrSettings.forms.common.descriptionOptional")}
                error={errors.description?.message}
              >
                <Input {...register("description")} maxLength={1000} />{" "}
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
                  ? t("hrSettings.forms.contractType.saveChanges")
                  : t("hrSettings.forms.contractType.addSubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
