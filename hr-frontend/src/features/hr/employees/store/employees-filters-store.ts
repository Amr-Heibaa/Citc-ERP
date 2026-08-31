import { create } from "zustand";

export type EmployeeExportFormat = "CSV" | "Excel" | "PDF" | "Full Profile PDF";

type EmployeesFiltersStore = {
  search: string;
  department: string;
  status: string;
  exportOpen: boolean;
  importOpen: boolean;
  exportFormat: EmployeeExportFormat;
  setSearch: (value: string) => void;
  setDepartment: (value: string) => void;
  setStatus: (value: string) => void;
  setExportOpen: (open: boolean) => void;
  setImportOpen: (open: boolean) => void;
  setExportFormat: (format: EmployeeExportFormat) => void;
  resetFilters: () => void;
};

const initialFilters = {
  search: "",
  department: "",
  status: "",
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
    setExportOpen: (exportOpen) => set({ exportOpen }),
    setImportOpen: (importOpen) => set({ importOpen }),
    setExportFormat: (exportFormat) => set({ exportFormat }),

    resetFilters: () => set(initialFilters),
  }),
);
