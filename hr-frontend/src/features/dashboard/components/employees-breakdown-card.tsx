import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useOrganizations } from "@/features/hr/organizations/api/use-organizations";
import { useEmployeesFiltersStore } from "@/features/hr/employees/store/employees-filters-store";

export function EmployeesBreakdownCard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const organizations = useOrganizations();
  const setOrganizationFilter = useEmployeesFiltersStore((state) => state.setOrganizationFilter);

  const rows = (organizations.data ?? [])
    .map((org) => ({
      id: org.id,
      name: (i18n.language === "ar" ? org.nameAr : org.nameEn) || org.nameEn || org.nameAr || org.code || "—",
      count: org.summary?.employees ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const total = rows.reduce((sum, row) => sum + row.count, 0);

  function handleRowClick(id: number | undefined, name: string) {
    if (id == null) {
      return;
    }

    setOrganizationFilter(id, name);
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
          {organizations.isLoading ? "—" : total}
        </p>
      </button>

      {!organizations.isLoading && rows.length > 0 && (
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
