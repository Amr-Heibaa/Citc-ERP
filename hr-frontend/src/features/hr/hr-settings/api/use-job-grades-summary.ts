import { useListGrades } from "@/lib/api/generated/ems/job-grade-controller/job-grade-controller";

export function useJobGradesSummary() {
  return useListGrades({});
}
