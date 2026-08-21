import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentityFormValues>({
    resolver: zodResolver(identitySchema),

    defaultValues: {
      username: defaults.username ?? "",
      email: defaults.email ?? "",
      password: defaults.password ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(next)} className="flex min-h-0 flex-1 flex-col">
      <WizardHeader
        step={1}
        title="Identity"
        description="The username and email we create for user"
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col justify-center gap-5 px-8 py-4">
          <LabeledField label="Username" error={errors.username?.message}>
            <Input {...register("username")} placeholder="Username" />
          </LabeledField>

          <LabeledField label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="Email" />
          </LabeledField>

          <LabeledField label="Password" error={errors.password?.message}>
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
            />
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

      <WizardFooter step={1} />
    </form>
  );
}
