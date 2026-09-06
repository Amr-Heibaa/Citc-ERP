import { create } from "zustand";

export type EmployeeExportFormat = "CSV" | "Excel" | "PDF" | "Full Profile PDF";

type EmployeesFiltersStore = {
  search: string;
  department: string;
  status: string;
  organizationId: number | null;
  organizationName: string;
  exportOpen: boolean;
  importOpen: boolean;
  exportFormat: EmployeeExportFormat;
  setSearch: (value: string) => void;
  setDepartment: (value: string) => void;
  setStatus: (value: string) => void;
  setOrganizationFilter: (id: number | null, name: string) => void;
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
    setExportOpen: (exportOpen) => set({ exportOpen }),
    setImportOpen: (importOpen) => set({ importOpen }),
    setExportFormat: (exportFormat) => set({ exportFormat }),

    resetFilters: () => set(initialFilters),
  }),
);
