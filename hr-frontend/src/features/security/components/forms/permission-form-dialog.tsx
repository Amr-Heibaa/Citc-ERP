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
import type { SecurityPermissionSummary } from "@/features/security/api/security-types";
import { useAllSecurityModules } from "@/features/security/api/use-security-modules";
import {
  useCreateSecurityPermission,
  useUpdateSecurityPermission,
} from "@/features/security/api/use-security-permissions";
import { FilterSelect } from "@/features/security/components/security-toolbar";
import {
  permissionSchema,
  permissionToFormValues,
  toPermissionRequest,
  type PermissionFormValues,
} from "@/features/security/schemas/definition-schemas";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

function PermissionForm({
  permission,
  onDone,
}: {
  permission?: SecurityPermissionSummary;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const editMode = permission != null;
  const modules = useAllSecurityModules();

  const createPermission = useCreateSecurityPermission();
  const updatePermission = useUpdateSecurityPermission(permission?.permissionId ?? 0);
  const pending = createPermission.isPending || updatePermission.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: permissionToFormValues(permission),
  });

  const active = useWatch({ control, name: "active" });
  const moduleId = useWatch({ control, name: "applicationModuleId" });

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updatePermission.mutateAsync(toPermissionRequest(values));
        toast.success(t("security.permissions.form.updated"));
      } else {
        await createPermission.mutateAsync(toPermissionRequest(values));
        toast.success(t("security.permissions.form.created"));
      }
      onDone();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, "security.permissions.form.saveError"));
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
        <LabeledField label={t("security.fields.code")} error={errors.code?.message}>
          <Input {...register("code")} maxLength={100} autoComplete="off" />
        </LabeledField>

        <LabeledField label={t("security.fields.name")} error={errors.name?.message}>
          <Input {...register("name")} maxLength={255} />
        </LabeledField>

        <div className="sm:col-span-2">
          <LabeledField label={t("security.fields.description")} error={errors.description?.message}>
            <Textarea {...register("description")} maxLength={255} rows={3} />
          </LabeledField>
        </div>

        <LabeledField label={t("security.fields.moduleOptional")}>
          <FilterSelect
            value={moduleId}
            onChange={(next) => setValue("applicationModuleId", next)}
            allLabel={t("security.permissions.form.noModule")}
            ariaLabel={t("security.fields.module")}
            className="w-full"
            options={(modules.data ?? []).map((module) => ({
              value: String(module.applicationModuleId),
              label: `${module.applicationName} (${module.applicationCode})`,
            }))}
          />
        </LabeledField>

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
              : t("security.permissions.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PermissionFormDialog({
  open,
  onOpenChange,
  permission,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: SecurityPermissionSummary;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="font-['Space_Grotesk',sans-serif] text-xl text-[#1a2535]">
            {permission
              ? t("security.permissions.form.editTitle")
              : t("security.permissions.form.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("security.permissions.form.description")}</DialogDescription>
        </DialogHeader>

        <PermissionForm
          key={permission?.permissionId ?? "new"}
          permission={permission}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
