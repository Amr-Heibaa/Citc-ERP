import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { EmployeeStatusBadge } from "@/features/hr/employees/components/employee-status-badge";
import { formatDate, initials } from "@/features/hr/shared/utils/format";
import type { EmployeeSummary } from "@/lib/api/generated/model";

const AVATAR_COLORS = [
  "bg-[#f5841f]",
  "bg-[#3498db]",
  "bg-[#9b59b6]",
  "bg-[#2ecc71]",
];

const COLUMN_KEYS = [
  "employees.table.employee",
  "employees.table.contact",
  "employees.table.department",
  "employees.table.position",
  "employees.table.status",
  "employees.table.joinDate",
];

function EmployeeRow({
  employee,
  onSelect,
}: {
  employee: EmployeeSummary;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const avatarColor =
    AVATAR_COLORS[(employee.employeeId ?? 0) % AVATAR_COLORS.length];

  function handleKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <tr
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-[#f4f6f9] focus:bg-[#f4f6f9] focus:outline-none"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${avatarColor}`}
          >
            {employee.profilePhotoDataUrl ? (
              <img
                src={employee.profilePhotoDataUrl}
                alt={employee.displayName ?? t("employees.table.employee")}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-['Inter',sans-serif] text-sm font-bold text-white">
                {initials(employee.displayName)}
              </span>
            )}
          </div>

          <div>
            <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
              {employee.displayName ?? t("employees.table.unnamedEmployee")}
            </p>

            <p className="font-['Inter',sans-serif] text-xs text-gray-400">
              {employee.employeeNumber}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="max-w-[220px] truncate font-['Inter',sans-serif] text-xs text-gray-500">
          {employee.businessEmail ?? employee.personalEmail ?? "—"}
        </p>

        <p className="font-['Inter',sans-serif] text-xs text-gray-500">
          {employee.mobileNumber ?? "—"}
        </p>
      </td>

      <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.currentOrgUnitName ?? "—"}
      </td>

      <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.positionTitle ?? "—"}
      </td>

      <td className="px-4 py-4">
        <EmployeeStatusBadge
          code={employee.statusCode}
          label={employee.statusName}
        />
      </td>

      <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-500">
        {formatDate(employee.startDate)}
      </td>
    </tr>
  );
}

export function EmployeesTable({
  employees,
  total,
  isLoading,
  isError,
  onRetry,
  onSelect,
}: {
  employees: EmployeeSummary[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (employee: EmployeeSummary) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {isError ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="size-9 text-red-400" />

          <div>
            <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
              {t("employees.table.unableToLoad")}
            </p>

            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              {t("employees.table.checkConnection")}
            </p>
          </div>

          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            {t("employees.table.tryAgain")}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                {COLUMN_KEYS.map((key, index) => (
                  <th
                    key={key}
                    className={`${
                      index === 0 ? "px-6" : "px-4"
                    } py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600`}
                  >
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td colSpan={COLUMN_KEYS.length} className="px-6 py-3">
                      <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMN_KEYS.length}
                    className="py-16 text-center font-['Inter',sans-serif] text-sm text-gray-400"
                  >
                    {t("employees.table.noMatches")}
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <EmployeeRow
                    key={employee.employeeId}
                    employee={employee}
                    onSelect={() => onSelect(employee)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isError && (
        <div className="border-t border-gray-100 px-6 py-3 font-['Inter',sans-serif] text-xs text-gray-400">
          {t("employees.table.showingOf", { count: employees.length, total })}
        </div>
      )}
    </div>
  );
}
