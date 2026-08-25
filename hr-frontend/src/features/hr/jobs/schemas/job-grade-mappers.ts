import type {
  CreateJobGradeRequest,
  JobGradeResponse,
  UpdateJobGradeRequest,
} from "@/lib/api/generated/model";

import type { JobGradeFormValues } from "@/features/hr/jobs/schemas/job-grade-schema";

export function toCreateJobGradeRequest(
  values: JobGradeFormValues,
): CreateJobGradeRequest {
  return {
    code: values.code.trim(),
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim(),
    rank: values.rank,
    active: values.active,
  };
}

export function toUpdateJobGradeRequest(
  values: JobGradeFormValues,
): UpdateJobGradeRequest {
  return {
    code: values.code.trim(),
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim(),
    rank: values.rank,
    active: values.active,
  };
}

export function jobGradeToFormValues(grade: JobGradeResponse): JobGradeFormValues {
  return {
    code: grade.code ?? "",
    nameEn: grade.nameEn ?? "",
    nameAr: grade.nameAr ?? "",
    rank: grade.rank ?? 1,
    active: grade.active ?? true,
  };
}
