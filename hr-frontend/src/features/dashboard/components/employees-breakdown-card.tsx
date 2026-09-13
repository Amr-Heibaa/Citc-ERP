import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueries } from "@tanstack/react-query";

import { useOrganizations } from "@/features/hr/organizations/api/use-organizations";
import { listOrganizationUnits } from "@/lib/api/generated/ems/organization-unit-controller/organization-unit-controller";
import { organizationUnitsQueryKey } from "@/features/hr/organizations/api/query-keys";
import { useEmployeesFiltersStore } from "@/features/hr/employees/store/employees-filters-store";

function isValidId(value: number | undefined): value is number {
  return Number.isInteger(value) && (value ?? 0) > 0;
}

export function EmployeesBreakdownCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const organizations = useOrganizations();
  const setDepartment = useEmployeesFiltersStore((state) => state.setDepartment);

  const organizationIds = (organizations.data ?? [])
    .map((org) => org.id)
    .filter(isValidId);

  const unitQueries = useQueries({
    queries: organizationIds.map((organizationId) => ({
      queryKey: organizationUnitsQueryKey(organizationId),
      queryFn: () => listOrganizationUnits(organizationId),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const unitsLoading = organizations.isLoading || unitQueries.some((query) => query.isLoading);

  // "Branches" are the top-level units directly under each organization
  // (no parent unit) — deeper departments/sections roll up into them.
  const rows = unitQueries
    .flatMap((query) => query.data ?? [])
    .filter((unit) => unit.parentUnitId == null && unit.name)
    .map((unit) => ({
      id: unit.id,
      name: unit.name as string,
      count: unit.employees ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Use the organization-level counts (known to add up to the real
  // headcount) for the header total — branch rows are for filtering only,
  // and a branch's "employees" count may or may not roll up its sub-units.
  const total = (organizations.data ?? []).reduce(
    (sum, org) => sum + (org.summary?.employees ?? 0),
    0,
  );

  function handleRowClick(name: string) {
    setDepartment(name);
    navigate("/hr/employees");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-[12px] bg-white p-5 shadow-[0px_4px_6px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={() => navigate("/hr/employees")}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: "#f5841f21" }}
          >
            <Users size={20} strokeWidth={2} style={{ color: "#f5841f" }} />
          </div>

          <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#6b7280]">
            {t("dashboard.totalEmployees")}
          </p>
        </div>

        <p className="font-['Space_Grotesk',sans-serif] text-[28px] font-bold text-[#1a2535]">
          {unitsLoading ? "—" : total}
        </p>
      </button>

      {!unitsLoading && rows.length > 0 && (
        <div className="flex flex-col divide-y divide-gray-100">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => handleRowClick(row.name)}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-gray-50"
            >
              <span className="font-['Inter',sans-serif] text-sm text-[#1a2535]">{row.name}</span>
              <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                {row.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
