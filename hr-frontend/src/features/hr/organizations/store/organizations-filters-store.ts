import { create } from "zustand";

type OrganizationsFiltersStore = {
  search: string;
  typeId: string;
  status: string;
  setSearch: (value: string) => void;
  setTypeId: (value: string) => void;
  setStatus: (value: string) => void;
  resetFilters: () => void;
};

const initialFilters = {
  search: "",
  typeId: "",
  status: "",
};

export const useOrganizationsFiltersStore = create<OrganizationsFiltersStore>(
  (set) => ({
    ...initialFilters,

    setSearch: (search) => set({ search }),
    setTypeId: (typeId) => set({ typeId }),
    setStatus: (status) => set({ status }),

    resetFilters: () => set(initialFilters),
  }),
);
