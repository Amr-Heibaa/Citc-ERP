import { useListEmployees } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { useListContractTypes } from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";
import { pageableParamsSerializer } from "@/lib/api/pageable";

const ALL_EMPLOYEES_PAGE_SIZE = 1000;

export function useEmployeesForReport() {
  return useListEmployees(
    { pageable: { size: ALL_EMPLOYEES_PAGE_SIZE } },
    {
      query: { select: (page) => page.content ?? [] },
      request: { paramsSerializer: pageableParamsSerializer },
    },
  );
}

export function useContractTypesForReport() {
  return useListContractTypes({ size: 500 });
}
