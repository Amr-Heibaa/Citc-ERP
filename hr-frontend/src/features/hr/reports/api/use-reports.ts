import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getEmployeeDetail } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { listContractTypes } from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";
import { useAllEmployees } from "@/features/hr/employees/api/use-employees";
import { fetchAllPages } from "@/lib/api/pageable";

export function useEmployeesForReport() {
  return useAllEmployees();
}

export function useContractTypesForReport() {
  return useQuery({
    queryKey: ["/api/hr/settings/contract-types", "all"],
    queryFn: () => fetchAllPages((page, size) => listContractTypes({ page, size })),
  });
}

// EmployeeSummary (the bulk list endpoint) doesn't carry per-employee
// contracts or birthDate - only EmployeeDetail does. Reports that need
// those (contract-type breakdown, age/retirement) fetch every employee's
// detail once here and cache it, same pattern as the "export all profiles"
// feature already uses.
export function useAllEmployeeDetailsForReport() {
  const employees = useAllEmployees();

  const employeeIds = useMemo(
    () =>
      (employees.data ?? [])
        .map((employee) => employee.employeeId)
        .filter((id): id is number => Number.isInteger(id)),
    [employees.data],
  );

  const detailsQuery = useQuery({
    queryKey: ["/api/hr/employees", "allDetails", employeeIds],
    queryFn: () => Promise.all(employeeIds.map((id) => getEmployeeDetail(id))),
    enabled: employees.isSuccess && employeeIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...detailsQuery,
    isLoading: employees.isLoading || detailsQuery.isLoading,
    isError: employees.isError || detailsQuery.isError,
  };
}
