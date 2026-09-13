import { create } from "zustand";

export type EmployeeExportFormat = "CSV" | "Excel" | "PDF" | "Full Profile PDF";

// Sentinel branchId for the dashboard's "Other" bucket: employees with no
// work location assigned at all, as opposed to a real location's id.
export const NO_WORK_LOCATION_ID = -1;

type EmployeesFiltersStore = {
  search: string;
  department: string;
  status: string;
  organizationId: number | null;
  organizationName: string;
  branchId: number | null;
  branchName: string;
  exportOpen: boolean;
  importOpen: boolean;
  exportFormat: EmployeeExportFormat;
  setSearch: (value: string) => void;
  setDepartment: (value: string) => void;
  setStatus: (value: string) => void;
  setOrganizationFilter: (id: number | null, name: string) => void;
  setBranchFilter: (id: number | null, name: string) => void;
  setExportOpen: (open: boolean) => void;
  setImportOpen: (open: boolean) => void;
  setExportFormat: (format: EmployeeExportFormat) => void;
  resetFilters: () => void;
};

const initialFilters = {
  search: "",
  department: "",
  status: "",
  organizationId: null as number | null,
  organizationName: "",
  branchId: null as number | null,
  branchName: "",
};

export const useEmployeesFiltersStore = create<EmployeesFiltersStore>(
  (set) => ({
    ...initialFilters,
    exportOpen: false,
    importOpen: false,
    exportFormat: "CSV",

    setSearch: (search) => set({ search }),
    setDepartment: (department) => set({ department }),
    setStatus: (status) => set({ status }),
    setOrganizationFilter: (organizationId, organizationName) =>
      set({ organizationId, organizationName }),
    setBranchFilter: (branchId, branchName) => set({ branchId, branchName }),
    setExportOpen: (exportOpen) => set({ exportOpen }),
    setImportOpen: (importOpen) => set({ importOpen }),
    setExportFormat: (exportFormat) => set({ exportFormat }),

    resetFilters: () => set(initialFilters),
  }),
);
