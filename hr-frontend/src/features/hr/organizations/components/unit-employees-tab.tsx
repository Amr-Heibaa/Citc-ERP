import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

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
import { EmployeeAvatar } from "@/features/hr/shared/components/employee-avatar";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { UnitEmployee } from "@/lib/api/generated/model";

const NO_EMPLOYEES: UnitEmployee[] = [];

export function UnitEmployeesTab({
  orgUnitId,
}: {
  orgUnitId: number;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        {t("organizations.unitEmployeesTab.loading")}
      </div>
    );
  }

  if (employeesQuery.isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        {t("organizations.unitEmployeesTab.unableToLoad")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <UnitTabToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t("organizations.unitEmployeesTab.searchPlaceholder")}
        exportDisabled={
          filtered.length === 0
        }
        onExport={handleExport}
      />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          {t("organizations.unitEmployeesTab.noEmployeesFound")}
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-[#f4f6f9]">
            <TableRow>
              <TableHead className="px-4">
                {t("organizations.unitEmployeesTab.employee")}
              </TableHead>

              <TableHead>
                {t("organizations.unitEmployeesTab.contact")}
              </TableHead>

              <TableHead>
                {t("organizations.unitEmployeesTab.department")}
              </TableHead>

              <TableHead>
                {t("organizations.unitEmployeesTab.position")}
              </TableHead>

              <TableHead>
                {t("common.status")}
              </TableHead>

              <TableHead>
                {t("organizations.unitEmployeesTab.joinDate")}
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
                  className={
                    employee.id != null
                      ? "cursor-pointer hover:bg-[#f4f6f9]"
                      : undefined
                  }
                  onClick={
                    employee.id != null
                      ? () => navigate(`/hr/employees/${employee.id}`)
                      : undefined
                  }
                >
                  <TableCell className="px-4">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar
                        employeeId={employee.id}
                        displayName={employee.name}
                        className="size-9"
                      />

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