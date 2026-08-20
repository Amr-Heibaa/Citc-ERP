import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCreateEmployee } from "@/features/hr/api/use-employees";
import { ContractStepForm } from "@/features/hr/forms/contract-step-form";
import { EmploymentStepForm } from "@/features/hr/forms/employment-step-form";
import { IdentityStepForm } from "@/features/hr/forms/identity-step-form";
import { PersonalInfoStepForm } from "@/features/hr/forms/personal-info-step-form";
import { PositionStepForm } from "@/features/hr/forms/position-step-form";
import { toCreateEmployeeRequest } from "@/features/hr/schemas/employee-mappers";
import type { ContractFormValues } from "@/features/hr/schemas/employee-schema";
import { useEmployeeWizardStore } from "@/features/hr/store/employee-wizard-store";

export function EmployeeCreateWizard() {
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

      toast.success("Employee created successfully");
      reset();
      navigate(`/hr/employees/${employeeId}`);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to create employee";

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
        <DialogTitle className="sr-only">Create Employee</DialogTitle>

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
