import { useMemo } from "react";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useEmployees } from "@/features/hr/employees/api/use-employees";
import {
  NO_WORK_LOCATION_ID,
  useEmployeesFiltersStore,
} from "@/features/hr/employees/store/employees-filters-store";
import type { EmployeeSummary } from "@/lib/api/generated/model";

const NO_EMPLOYEES: EmployeeSummary[] = [];

export function EmployeesBreakdownCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const employeesQuery = useEmployees();
  const setBranchFilter = useEmployeesFiltersStore((state) => state.setBranchFilter);

  const isLoading = employeesQuery.isLoading;
  const employees = employeesQuery.data ?? NO_EMPLOYEES;
  const total = employees.length;

  const rows = useMemo(() => {
    const countByLocation = new Map<number, { id: number; name: string; count: number }>();
    let unassignedCount = 0;

    employees.forEach((employee) => {
      if (employee.workLocationId == null || !employee.workLocationName) {
        unassignedCount += 1;
        return;
      }

      const existing = countByLocation.get(employee.workLocationId);

      if (existing) {
        existing.count += 1;
      } else {
        countByLocation.set(employee.workLocationId, {
          id: employee.workLocationId,
          name: employee.workLocationName,
          count: 1,
        });
      }
    });

    const sorted = [...countByLocation.values()].sort((a, b) => b.count - a.count);

    if (unassignedCount > 0) {
      sorted.push({ id: NO_WORK_LOCATION_ID, name: t("dashboard.otherLocation"), count: unassignedCount });
    }

    return sorted;
  }, [employees, t]);

  function handleRowClick(id: number, name: string) {
    setBranchFilter(id, name);
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
          {isLoading ? "—" : total}
        </p>
      </button>

      {!isLoading && rows.length > 0 && (
        <div className="flex flex-col divide-y divide-gray-100">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => handleRowClick(row.id, row.name)}
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
