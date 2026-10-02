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
import type { SecurityRoleSummary } from "@/features/security/api/security-types";
import {
  useCreateSecurityRole,
  useUpdateSecurityRole,
} from "@/features/security/api/use-security-roles";
import {
  roleSchema,
  roleToFormValues,
  toRoleRequest,
  type RoleFormValues,
} from "@/features/security/schemas/definition-schemas";
import { SYSTEM_ADMIN, isProtectedRole } from "@/features/security/utils/security-access";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

function RoleForm({ role, onDone }: { role?: SecurityRoleSummary; onDone: () => void }) {
  const { t } = useTranslation();
  const editMode = role != null;
  const builtIn = editMode && isProtectedRole(role.roleCode);
  const isSystemAdminRole = editMode && role.roleCode.toUpperCase() === SYSTEM_ADMIN;

  const createRole = useCreateSecurityRole();
  const updateRole = useUpdateSecurityRole(role?.roleId ?? 0);
  const pending = createRole.isPending || updateRole.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: roleToFormValues(role),
  });

  const active = useWatch({ control, name: "active" });

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateRole.mutateAsync(toRoleRequest(values));
        toast.success(t("security.roles.form.updated"));
      } else {
        await createRole.mutateAsync(toRoleRequest(values));
        toast.success(t("security.roles.form.created"));
      }
      onDone();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, "security.roles.form.saveError"));
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
        <LabeledField label={t("security.fields.code")} error={errors.code?.message}>
          <Input {...register("code")} maxLength={50} disabled={builtIn} autoComplete="off" />
        </LabeledField>

        <LabeledField label={t("security.fields.name")} error={errors.name?.message}>
          <Input {...register("name")} maxLength={100} disabled={builtIn} />
        </LabeledField>

        <div className="sm:col-span-2">
          <LabeledField label={t("security.fields.description")} error={errors.description?.message}>
            <Textarea {...register("description")} maxLength={255} rows={3} />
          </LabeledField>
        </div>

        <LabeledField label={t("security.fields.status")}>
          <StatusSelectField
            active={active}
            onChange={(next) => setValue("active", next)}
            disableInactive={isSystemAdminRole}
          />
        </LabeledField>

        {builtIn && (
          <p className="self-end font-['Inter',sans-serif] text-xs text-gray-400 sm:col-span-2">
            {isSystemAdminRole
              ? t("security.roles.form.systemAdminHint")
              : t("security.roles.form.builtInHint")}
          </p>
        )}
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
              : t("security.roles.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: SecurityRoleSummary;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="font-['Space_Grotesk',sans-serif] text-xl text-[#1a2535]">
            {role ? t("security.roles.form.editTitle") : t("security.roles.form.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("security.roles.form.description")}</DialogDescription>
        </DialogHeader>

        <RoleForm key={role?.roleId ?? "new"} role={role} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
