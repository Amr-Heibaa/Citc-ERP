import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useEmploymentDirectory } from "@/features/hr/employment/api/use-employment-directory";
import { EmploymentFiltersBar } from "@/features/hr/employment/components/employment-filters-bar";
import { EmploymentTable } from "@/features/hr/employment/components/employment-table";
import { useEmploymentFiltersStore } from "@/features/hr/employment/store/employment-filters-store";
import type { EmployeeSummary } from "@/lib/api/generated/model";

const NO_EMPLOYEES: EmployeeSummary[] = [];

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
        {value}
      </p>

      <p className="font-['Inter',sans-serif] text-xs text-gray-400">{label}</p>
    </div>
  );
}

export function EmploymentRecordsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const directoryQuery = useEmploymentDirectory();
  const employees = directoryQuery.data ?? NO_EMPLOYEES;

  const search = useEmploymentFiltersStore((state) => state.search);
  const orgUnit = useEmploymentFiltersStore((state) => state.orgUnit);
  const status = useEmploymentFiltersStore((state) => state.status);

  const orgUnits = useMemo(() => {
    const values = employees
      .map((employee) => employee.currentOrgUnitName)
      .filter((value): value is string => Boolean(value));

    return [...new Set(values)].sort();
  }, [employees]);

  const statuses = useMemo(() => {
    const map = new Map<string, string>();

    employees.forEach((employee) => {
      if (employee.statusCode) {
        map.set(
          employee.statusCode,
          employee.statusName ?? employee.statusCode,
        );
      }
    });

    return [...map.entries()].sort((first, second) =>
      first[1].localeCompare(second[1]),
    );
  }, [employees]);

  const stats = useMemo(() => {
    const counts = { active: 0, probation: 0, onLeave: 0, terminated: 0 };

    for (const employee of employees) {
      switch (employee.statusCode) {
        case "ACTIVE":
          counts.active += 1;
          break;
        case "PROBATION":
          counts.probation += 1;
          break;
        case "ON_LEAVE":
          counts.onLeave += 1;
          break;
        case "TERMINATED":
        case "RESIGNED":
        case "RETIRED":
        case "CONTRACT_END":
        case "INACTIVE":
          counts.terminated += 1;
          break;
        default:
          break;
      }
    }

    return counts;
  }, [employees]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.displayName?.toLowerCase().includes(query) ||
        employee.employeeNumber?.toLowerCase().includes(query) ||
        employee.businessEmail?.toLowerCase().includes(query) ||
        employee.personalEmail?.toLowerCase().includes(query);

      const matchesOrgUnit = !orgUnit || employee.currentOrgUnitName === orgUnit;
      const matchesStatus = !status || employee.statusCode === status;

      return Boolean(matchesSearch && matchesOrgUnit && matchesStatus);
    });
  }, [employees, orgUnit, search, status]);

  function handleSelect(employee: EmployeeSummary) {
    navigate(`/hr/employees/${employee.employeeId}?tab=employment`);
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate("/hr/employment")}
        className="flex w-fit items-center gap-1 font-['Inter',sans-serif] text-sm text-gray-500 hover:text-[#1a2535]"
      >
        <ChevronLeft className="size-4" />
        {t("employment.records.backLink")}
      </button>

      <div>
        <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
          {t("employment.records.title")}
        </h1>

        <p className="font-['Inter',sans-serif] text-sm text-gray-400">
          {t("employment.records.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatChip label={t("employment.records.stats.active")} value={stats.active} />
        <StatChip label={t("employment.records.stats.probation")} value={stats.probation} />
        <StatChip label={t("employment.records.stats.onLeave")} value={stats.onLeave} />
        <StatChip
          label={t("employment.records.stats.terminated")}
          value={stats.terminated}
        />
      </div>

      <EmploymentFiltersBar orgUnits={orgUnits} statuses={statuses} />

      <EmploymentTable
        employees={filtered}
        total={employees.length}
        isLoading={directoryQuery.isLoading}
        isError={directoryQuery.isError}
        onRetry={() => directoryQuery.refetch()}
        onSelect={handleSelect}
      />
    </div>
  );
}
