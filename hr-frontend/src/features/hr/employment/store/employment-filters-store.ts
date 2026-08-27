import { create } from "zustand";

type EmploymentFiltersStore = {
  search: string;
  orgUnit: string;
  status: string;
  setSearch: (value: string) => void;
  setOrgUnit: (value: string) => void;
  setStatus: (value: string) => void;
  resetFilters: () => void;
};

const initialFilters = {
  search: "",
  orgUnit: "",
  status: "",
};

export const useEmploymentFiltersStore = create<EmploymentFiltersStore>(
  (set) => ({
    ...initialFilters,

    setSearch: (search) => set({ search }),
    setOrgUnit: (orgUnit) => set({ orgUnit }),
    setStatus: (status) => set({ status }),

    resetFilters: () => set(initialFilters),
  }),
);
