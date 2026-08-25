import {
  getGetGradeHistoryQueryKey,
  getGetGradeQueryKey,
  getListGradesQueryKey,
} from "@/lib/api/generated/ems/job-grade-controller/job-grade-controller";

import {
  getGetHierarchyQueryKey,
  getGetPositionHistoryQueryKey,
  getGetPositionQueryKey,
  getGetStatisticsQueryKey,
  getListAssignmentsQueryKey,
  getListPositionsQueryKey,
} from "@/lib/api/generated/ems/job-position-controller/job-position-controller";

const JOB_PREFIX = "/api/hr/jobs";

export const gradeListQueryKey = getListGradesQueryKey;
export const gradeDetailQueryKey = getGetGradeQueryKey;
export const gradeHistoryQueryKey = getGetGradeHistoryQueryKey;

export const positionListQueryKey = getListPositionsQueryKey;
export const positionDetailQueryKey = getGetPositionQueryKey;
export const positionHistoryQueryKey = getGetPositionHistoryQueryKey;
export const positionAssignmentsQueryKey = getListAssignmentsQueryKey;
export const positionStatisticsQueryKey = getGetStatisticsQueryKey;
export const positionHierarchyQueryKey = getGetHierarchyQueryKey;

function firstQueryKeyPart(queryKey: readonly unknown[]): string | null {
  const [first] = queryKey;

  return typeof first === "string" ? first : null;
}

export function isJobQueryKey(queryKey: readonly unknown[]): boolean {
  const first = firstQueryKeyPart(queryKey);

  return first?.startsWith(JOB_PREFIX) ?? false;
}
