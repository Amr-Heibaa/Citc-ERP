import { useListEmployees } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { pageableParamsSerializer } from "@/lib/api/pageable";

const REFERENCE_STALE_TIME = 5 * 60 * 1000;
const ALL_EMPLOYEES_PAGE_SIZE = 1000;

export function useEmploymentDirectory() {
  return useListEmployees(
    { pageable: { size: ALL_EMPLOYEES_PAGE_SIZE } },
    {
      query: { staleTime: REFERENCE_STALE_TIME, select: (page) => page.content ?? [] },
      request: { paramsSerializer: pageableParamsSerializer },
    },
  );
}
