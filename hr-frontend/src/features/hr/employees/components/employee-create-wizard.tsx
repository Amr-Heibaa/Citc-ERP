import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateEmployee } from "@/features/hr/employees/api/use-employees";
import { ContractStepForm } from "@/features/hr/employees/forms/contract-step-form";
import { EmploymentStepForm } from "@/features/hr/employees/forms/employment-step-form";
import { IdentityStepForm } from "@/features/hr/employees/forms/identity-step-form";
import { PersonalInfoStepForm } from "@/features/hr/employees/forms/personal-info-step-form";
import { PositionStepForm } from "@/features/hr/employees/forms/position-step-form";
import { toCreateEmployeeRequest } from "@/features/hr/employees/schemas/employee-mappers";
import type { ContractFormValues } from "@/features/hr/employees/schemas/employee-schema";
import { useEmployeeWizardStore } from "@/features/hr/employees/store/employee-wizard-store";

export function EmployeeCreateWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mutation = useCreateEmployee();

  const step = useEmployeeWizardStore((state) => state.step);
  const data = useEmployeeWizardStore((state) => state.data);
  const goToStep = useEmployeeWizardStore((state) => state.goToStep);
  const saveStep = useEmployeeWizardStore((state) => state.saveStep);
  const reset = useEmployeeWizardStore((state) => state.reset);

  // The wizard store is a module-level singleton, so it must be reset
  // whenever this dialog leaves the tree — otherwise the next "Create
  // Employee" would reopen with stale data from a previous attempt.
  useEffect(() => reset, [reset]);

  const create = async (contract: ContractFormValues = {}) => {
    const all = { ...data, ...contract };

    try {
      const employeeId = await mutation.mutateAsync({
        account: {
          username: all.username ?? "",
          email: all.email ?? "",
          password: all.password ?? "",
        },
        employee: toCreateEmployeeRequest(all),
      });

      toast.success(t("employees.wizard.createdSuccess"));
      reset();
      navigate(`/hr/employees/${employeeId}`);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : t("employees.wizard.createError");

      toast.error(message);
    }
  };

  function close() {
    reset();
    navigate("/hr/employees");
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1140px, 95vw)",
          maxWidth: "none",
          height: "min(663px, 92vh)",
        }}
      >
        <DialogTitle className="sr-only">{t("employees.wizard.createEmployeeTitle")}</DialogTitle>

        {step === 1 && (
          <IdentityStepForm
            defaults={data}
            next={(values) => saveStep(values, 2)}
          />
        )}

        {step === 2 && (
          <PersonalInfoStepForm
            defaults={data}
            next={(values) => saveStep(values, 3)}
            back={() => goToStep(1)}
          />
        )}

        {step === 3 && (
          <EmploymentStepForm
            defaults={data}
            next={(values) => saveStep(values, 4)}
            back={() => goToStep(2)}
            skip={() => saveStep({}, 4)}
          />
        )}

        {step === 4 && (
          <PositionStepForm
            defaults={data}
            next={(values) => saveStep(values, 5)}
            back={() => goToStep(3)}
            skip={() => saveStep({}, 5)}
          />
        )}

        {step === 5 && (
          <ContractStepForm
            defaults={data}
            submit={create}
            back={() => goToStep(4)}
            skip={() => create({})}
            pending={mutation.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
