import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { WizardFooter } from "@/features/hr/employees/components/wizard-footer";
import { WizardHeader } from "@/features/hr/employees/components/wizard-header";
import {
  identitySchema,
  type EmployeeWizardData,
  type IdentityFormValues,
} from "@/features/hr/employees/schemas/employee-schema";

export function IdentityStepForm({
  defaults,
  next,
}: {
  defaults: EmployeeWizardData;
  next: (values: IdentityFormValues) => void;
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),

    mode: "onChange",

    defaultValues: {
      username: defaults.username ?? "",
      email: defaults.email ?? "",
      password: defaults.password ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(next)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <WizardHeader
        step={1}
        title={t("employees.wizard.identity.title")}
        description={t("employees.wizard.identity.description")}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col justify-center gap-5 px-8 py-4">
          <LabeledField label={t("employees.wizard.identity.username")} error={errors.username?.message}>
            <Input {...register("username")} placeholder={t("employees.wizard.identity.username")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.identity.email")} error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder={t("employees.wizard.identity.email")} />
          </LabeledField>

          <LabeledField label={t("employees.wizard.identity.password")} error={errors.password?.message}>
            <div className="space-y-2">
              <Input
                {...register("password")}
                type="password"
                placeholder={t("employees.wizard.identity.password")}
                autoComplete="new-password"
              />

              <p className="text-xs text-[#6b7280]">
                {t("employees.wizard.identity.passwordHint")}
              </p>
            </div>
          </LabeledField>
        </div>

        <div className="hidden w-[560px] items-center justify-center overflow-hidden lg:flex">
          <img
            src="/create-employee-identity.png"
            alt=""
            className="max-h-[400px] w-full object-contain"
          />
        </div>
      </div>
      <WizardFooter step={1} submitDisabled={!isValid} />{" "}
    </form>
  );
}
