import { useMemo } from "react";
import { FileUp } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useEmployees } from "@/features/hr/employees/api/use-employees";
import { useEmployeesFiltersStore } from "@/features/hr/employees/store/employees-filters-store";
import { EmployeeImportDialog } from "@/features/hr/employees/components/employee-import-dialog";
import { EmployeesExportDialog } from "@/features/hr/employees/components/employees-export-dialog";
import { EmployeesFiltersBar } from "@/features/hr/employees/components/employees-filters-bar";
import { EmployeesTable } from "@/features/hr/employees/components/employees-table";
import type { EmployeeSummary } from "@/lib/api/generated/model";

const NO_EMPLOYEES: EmployeeSummary[] = [];

export function EmployeesPage() {
  const navigate = useNavigate();
  const employeesQuery = useEmployees();
  const employees = employeesQuery.data ?? NO_EMPLOYEES;

  const search = useEmployeesFiltersStore((state) => state.search);
  const department = useEmployeesFiltersStore((state) => state.department);
  const status = useEmployeesFiltersStore((state) => state.status);
  const importOpen = useEmployeesFiltersStore((state) => state.importOpen);
  const setImportOpen = useEmployeesFiltersStore((state) => state.setImportOpen);

  const departments = useMemo(() => {
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.displayName?.toLowerCase().includes(query) ||
        employee.employeeNumber?.toLowerCase().includes(query) ||
        employee.businessEmail?.toLowerCase().includes(query) ||
        employee.personalEmail?.toLowerCase().includes(query);

      const matchesDepartment =
        !department || employee.currentOrgUnitName === department;

      const matchesStatus = !status || employee.statusCode === status;

      return Boolean(matchesSearch && matchesDepartment && matchesStatus);
    });
  }, [department, employees, search, status]);

  function handleSelect(employee: EmployeeSummary) {
    navigate(`/hr/employees/${employee.employeeId}`);
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
              Employees
            </h1>

            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              Manage and view all employee information
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="h-10 gap-2"
            >
              <FileUp className="size-4" />
              Import Employees
            </Button>

            <Button
              onClick={() => navigate("/hr/employees/new")}
              className="h-10 bg-[#1a2535] text-white hover:bg-[#243347]"
            >
              Add Employee
            </Button>
          </div>
        </div>

        <EmployeesFiltersBar
          departments={departments}
          statuses={statuses}
          exportDisabled={employeesQuery.isLoading || filtered.length === 0}
        />

        <EmployeesTable
          employees={filtered}
          total={employees.length}
          isLoading={employeesQuery.isLoading}
          isError={employeesQuery.isError}
          onRetry={() => employeesQuery.refetch()}
          onSelect={handleSelect}
        />
      </div>

      <EmployeesExportDialog employees={filtered} />
      <EmployeeImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
