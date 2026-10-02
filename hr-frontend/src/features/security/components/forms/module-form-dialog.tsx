import { zodResolver } from "@hookform/resolvers/zod";
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
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { SecurityModuleSummary } from "@/features/security/api/security-types";
import {
  useCreateSecurityModule,
  useUpdateSecurityModule,
} from "@/features/security/api/use-security-modules";
import {
  moduleSchema,
  moduleToFormValues,
  toModuleRequest,
  type ModuleFormValues,
} from "@/features/security/schemas/definition-schemas";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

function ModuleForm({ module, onDone }: { module?: SecurityModuleSummary; onDone: () => void }) {
  const { t } = useTranslation();
  const editMode = module != null;

  const createModule = useCreateSecurityModule();
  const updateModule = useUpdateSecurityModule(module?.applicationModuleId ?? 0);
  const pending = createModule.isPending || updateModule.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: moduleToFormValues(module),
  });

  const active = useWatch({ control, name: "active" });

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateModule.mutateAsync(toModuleRequest(values));
        toast.success(t("security.modules.form.updated"));
      } else {
        await createModule.mutateAsync(toModuleRequest(values));
        toast.success(t("security.modules.form.created"));
      }
      onDone();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, "security.modules.form.saveError"));
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
        <LabeledField label={t("security.fields.code")} error={errors.code?.message}>
          <Input {...register("code")} maxLength={50} autoComplete="off" />
        </LabeledField>

        <LabeledField label={t("security.fields.name")} error={errors.name?.message}>
          <Input {...register("name")} maxLength={100} />
        </LabeledField>

        <div className="sm:col-span-2">
          <LabeledField label={t("security.fields.description")} error={errors.description?.message}>
            <Textarea {...register("description")} maxLength={255} rows={3} />
          </LabeledField>
        </div>

        <LabeledField label={t("security.fields.status")}>
          <StatusSelectField active={active} onChange={(next) => setValue("active", next)} />
        </LabeledField>
      </div>

      <DialogFooter className="border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={pending} className="bg-[#1a2535] text-white hover:bg-[#243347]">
          {pending
            ? t("security.common.saving")
            : editMode
              ? t("security.common.saveChanges")
              : t("security.modules.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModuleFormDialog({
  open,
  onOpenChange,
  module,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: SecurityModuleSummary;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="font-['Space_Grotesk',sans-serif] text-xl text-[#1a2535]">
            {module ? t("security.modules.form.editTitle") : t("security.modules.form.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("security.modules.form.description")}</DialogDescription>
        </DialogHeader>

        <ModuleForm
          key={module?.applicationModuleId ?? "new"}
          module={module}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
