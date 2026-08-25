import { create } from "zustand";

type JobPositionsFiltersStore = {
  search: string;
  organizationId: string;
  orgUnitId: string;
  gradeId: string;
  status: string;
  occupancy: string;
  page: number;
  setSearch: (value: string) => void;
  setOrganizationId: (value: string) => void;
  setOrgUnitId: (value: string) => void;
  setGradeId: (value: string) => void;
  setStatus: (value: string) => void;
  setOccupancy: (value: string) => void;
  setPage: (value: number) => void;
  resetFilters: () => void;
};

const initialFilters = {
  search: "",
  organizationId: "",
  orgUnitId: "",
  gradeId: "",
  status: "",
  occupancy: "",
  page: 0,
};

export const useJobPositionsFiltersStore = create<JobPositionsFiltersStore>(
  (set) => ({
    ...initialFilters,

    setSearch: (search) => set({ search, page: 0 }),
    setOrganizationId: (organizationId) =>
      set({ organizationId, orgUnitId: "", page: 0 }),
    setOrgUnitId: (orgUnitId) => set({ orgUnitId, page: 0 }),
    setGradeId: (gradeId) => set({ gradeId, page: 0 }),
    setStatus: (status) => set({ status, page: 0 }),
    setOccupancy: (occupancy) => set({ occupancy, page: 0 }),
    setPage: (page) => set({ page }),

    resetFilters: () => set(initialFilters),
  }),
);
