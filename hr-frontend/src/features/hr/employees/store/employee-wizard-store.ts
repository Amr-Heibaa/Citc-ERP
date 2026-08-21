import { create } from "zustand";

import type { EmployeeWizardData } from "@/features/hr/employees/schemas/employee-schema";

export type EmployeeWizardStep = 1 | 2 | 3 | 4 | 5;

type EmployeeWizardStore = {
  step: EmployeeWizardStep;
  data: EmployeeWizardData;
  goToStep: (step: EmployeeWizardStep) => void;
  saveStep: (
    values: EmployeeWizardData,
    nextStep: EmployeeWizardStep,
  ) => void;
  reset: () => void;
};

const initialState: Pick<EmployeeWizardStore, "step" | "data"> = {
  step: 1,
  data: {},
};

export const useEmployeeWizardStore = create<EmployeeWizardStore>((set) => ({
  ...initialState,

  goToStep: (step) => set({ step }),

  saveStep: (values, nextStep) =>
    set((state) => ({
      data: { ...state.data, ...values },
      step: nextStep,
    })),

  reset: () => set(initialState),
}));
