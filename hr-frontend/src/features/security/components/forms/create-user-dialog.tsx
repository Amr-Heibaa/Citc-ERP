import { zodResolver } from "@hookform/resolvers/zod";
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
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { useCreateSecurityUser } from "@/features/security/api/use-security-users";
import {
  createUserSchema,
  EMPTY_CREATE_USER,
  toCreateUserRequest,
  type CreateUserFormValues,
} from "@/features/security/schemas/user-schema";
import { securityErrorMessage } from "@/features/security/utils/security-errors";

function CreateUserForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const createUser = useCreateSecurityUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: EMPTY_CREATE_USER,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await createUser.mutateAsync(toCreateUserRequest(values));
      toast.success(t("security.users.create.success"));
      onDone();
    } catch (error) {
      toast.error(securityErrorMessage(error, t, "security.users.create.error"));
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-4 px-6 py-5">
        <LabeledField label={t("security.fields.username")} error={errors.username?.message}>
          <Input {...register("username")} autoComplete="off" maxLength={100} />
        </LabeledField>

        <LabeledField label={t("security.fields.email")} error={errors.email?.message}>
          <Input type="email" {...register("email")} autoComplete="off" />
        </LabeledField>

        <LabeledField label={t("security.fields.initialPassword")} error={errors.password?.message}>
          <Input type="password" {...register("password")} autoComplete="new-password" />
        </LabeledField>
      </div>

      <DialogFooter className="border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onDone} disabled={createUser.isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={createUser.isPending}
          className="bg-[#1a2535] text-white hover:bg-[#243347]"
        >
          {createUser.isPending ? t("security.common.saving") : t("security.users.create.submit")}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** Uses the existing POST /api/auth/users account-creation contract. */
export function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="font-['Space_Grotesk',sans-serif] text-xl text-[#1a2535]">
            {t("security.users.create.title")}
          </DialogTitle>
          <DialogDescription>{t("security.users.create.description")}</DialogDescription>
        </DialogHeader>

        <CreateUserForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
