import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganizationUnitEmployees } from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import { UnitTabToolbar } from "@/features/hr/organizations/components/unit-tab-toolbar";
import { downloadUnitCsv } from "@/features/hr/organizations/utils/organization-unit-export";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { UnitEmployee } from "@/lib/api/generated/model";

const NO_EMPLOYEES: UnitEmployee[] = [];

function initials(
  name?: string,
): string {
  if (!name) {
    return "—";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UnitEmployeesTab({
  orgUnitId,
}: {
  orgUnitId: number;
}) {
  const [search, setSearch] =
    useState("");

  const employeesQuery =
    useOrganizationUnitEmployees(
      orgUnitId,
    );

  const employees =
    employeesQuery.data ??
    NO_EMPLOYEES;

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.name
          ?.toLowerCase()
          .includes(query) ||
        employee.empCode
          ?.toLowerCase()
          .includes(query) ||
        employee.email
          ?.toLowerCase()
          .includes(query) ||
        employee.department
          ?.toLowerCase()
          .includes(query) ||
        employee.position
          ?.toLowerCase()
          .includes(query),
    );
  }, [employees, search]);

  function handleExport() {
    downloadUnitCsv(
      `unit-${orgUnitId}-employees.csv`,
      filtered.map((employee) => ({
        "Employee Code":
          employee.empCode,
        "Employee Name":
          employee.name,
        Email: employee.email,
        Phone: employee.phone,
        Department:
          employee.department,
        Position:
          employee.position,
        Status:
          employee.status,
        "Join Date":
          employee.joinDate,
      })),
    );
  }

  if (employeesQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading unit employees…
      </div>
    );
  }

  if (employeesQuery.isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        Unable to load unit employees.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <UnitTabToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search for name, code, department..."
        exportDisabled={
          filtered.length === 0
        }
        onExport={handleExport}
      />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          No employees found.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-[#f4f6f9]">
            <TableRow>
              <TableHead className="px-4">
                Employee
              </TableHead>

              <TableHead>
                Contact
              </TableHead>

              <TableHead>
                Department
              </TableHead>

              <TableHead>
                Position
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Join Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map(
              (employee, index) => (
                <TableRow
                  key={
                    employee.id ??
                    `${employee.empCode}-${index}`
                  }
                >
                  <TableCell className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5841f] text-xs font-bold text-white">
                        {initials(
                          employee.name,
                        )}
                      </div>

                      <div>
                        <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                          {employee.name ??
                            "—"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {employee.empCode ??
                            "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs text-[#1a2535]">
                      {employee.email ??
                        "—"}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      {employee.phone ??
                        "—"}
                    </p>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {employee.department ??
                      "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {employee.position ??
                      "—"}
                  </TableCell>

                  <TableCell>
                    <OrganizationStatusBadge
                      status={
                        employee.status
                      }
                    />
                  </TableCell>

                  <TableCell className="text-sm text-gray-500">
                    {formatDate(
                      employee.joinDate,
                    )}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}