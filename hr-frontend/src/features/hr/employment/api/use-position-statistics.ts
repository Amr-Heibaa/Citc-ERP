import { useGetStatistics } from "@/lib/api/generated/ems/job-position-controller/job-position-controller";

export function usePositionAssignmentStatistics() {
  return useGetStatistics({});
}
