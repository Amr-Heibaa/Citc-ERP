import { AlertCircle, RefreshCw } from "lucide-react";

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

const COLUMNS = [
  "Employee",
  "Contact",
  "Department",
  "Position",
  "Status",
  "Join Date",
];

function EmployeeRow({
  employee,
  onSelect,
}: {
  employee: EmployeeSummary;
  onSelect: () => void;
}) {
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
                alt={employee.displayName ?? "Employee"}
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
              {employee.displayName ?? "Unnamed employee"}
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
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {isError ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="size-9 text-red-400" />

          <div>
            <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
              Unable to load employees
            </p>

            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              Check the server connection and try again.
            </p>
          </div>

          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                {COLUMNS.map((label) => (
                  <th
                    key={label}
                    className={`${
                      label === "Employee" ? "px-6" : "px-4"
                    } py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td colSpan={COLUMNS.length} className="px-6 py-3">
                      <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="py-16 text-center font-['Inter',sans-serif] text-sm text-gray-400"
                  >
                    No employees match the current filters.
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
          Showing {employees.length} of {total}
        </div>
      )}
    </div>
  );
}
