import { useListEmployees } from "@/lib/api/generated/ems/employee-controller/employee-controller";

const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export function useEmploymentDirectory() {
  return useListEmployees({ query: { staleTime: REFERENCE_STALE_TIME } });
}
