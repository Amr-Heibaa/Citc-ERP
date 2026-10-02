import { create } from "zustand";

// UI-only list state (search text, filters, page) so returning from a detail
// page restores the list where the user left it. Server data stays in
// React Query.

export type SecurityListKey = "users" | "roles" | "permissions" | "modules" | "auditLogs";

export type SecurityListFilters = {
  search: string;
  /** "" = all, "active" | "inactive" for definitions, backend status for users. */
  status: string;
  roleId: string;
  moduleId: string;
  page: number;
};

const INITIAL_FILTERS: SecurityListFilters = {
  search: "",
  status: "",
  roleId: "",
  moduleId: "",
  page: 0,
};

type SecurityFiltersStore = {
  lists: Record<SecurityListKey, SecurityListFilters>;
  /** Updates filters and resets the page to zero. */
  setFilters: (list: SecurityListKey, patch: Partial<Omit<SecurityListFilters, "page">>) => void;
  setPage: (list: SecurityListKey, page: number) => void;
};

export const useSecurityFiltersStore = create<SecurityFiltersStore>((set) => ({
  lists: {
    users: INITIAL_FILTERS,
    roles: INITIAL_FILTERS,
    permissions: INITIAL_FILTERS,
    modules: INITIAL_FILTERS,
    auditLogs: INITIAL_FILTERS,
  },
  setFilters: (list, patch) =>
    set((state) => ({
      lists: { ...state.lists, [list]: { ...state.lists[list], ...patch, page: 0 } },
    })),
  setPage: (list, page) =>
    set((state) => ({
      lists: { ...state.lists, [list]: { ...state.lists[list], page } },
    })),
}));

/** "active" -> true, "inactive" -> false, "" -> undefined. */
export function activeFilterValue(status: string): boolean | undefined {
  if (status === "active") return true;
  if (status === "inactive") return false;
  return undefined;
}
