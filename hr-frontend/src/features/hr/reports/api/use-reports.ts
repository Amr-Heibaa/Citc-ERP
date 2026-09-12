import { useQuery } from "@tanstack/react-query";

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
