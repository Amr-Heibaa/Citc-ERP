import type {
  CreateJobPositionRequest,
  JobPositionDetail,
  UpdateJobPositionRequest,
} from "@/lib/api/generated/model";

import type { JobPositionFormValues } from "@/features/hr/jobs/schemas/job-position-schema";

export function toCreateJobPositionRequest(
  values: JobPositionFormValues,
): CreateJobPositionRequest {
  return {
    code: values.code?.trim() || undefined,
    titleEn: values.titleEn.trim(),
    titleAr: values.titleAr.trim(),
    orgUnitId: Number(values.orgUnitId),
    gradeId: values.gradeId ? Number(values.gradeId) : undefined,
    positionLevel: values.positionLevel,
    reportsToPositionId: values.reportsToPositionId
      ? Number(values.reportsToPositionId)
      : undefined,
    descriptionEn: values.descriptionEn?.trim() || undefined,
    descriptionAr: values.descriptionAr?.trim() || undefined,
    open: values.open,
    active: values.active,
  };
}

export function toUpdateJobPositionRequest(
  values: JobPositionFormValues,
): UpdateJobPositionRequest {
  return {
    code: values.code?.trim() || "",
    titleEn: values.titleEn.trim(),
    titleAr: values.titleAr.trim(),
    orgUnitId: Number(values.orgUnitId),
    gradeId: values.gradeId ? Number(values.gradeId) : undefined,
    positionLevel: values.positionLevel,
    reportsToPositionId: values.reportsToPositionId
      ? Number(values.reportsToPositionId)
      : undefined,
    descriptionEn: values.descriptionEn?.trim() || undefined,
    descriptionAr: values.descriptionAr?.trim() || undefined,
    open: values.open,
    active: values.active,
  };
}

export function jobPositionDetailToFormValues(
  position: JobPositionDetail,
): JobPositionFormValues {
  return {
    code: position.code ?? "",
    titleEn: position.titleEn ?? "",
    titleAr: position.titleAr ?? "",
    organizationId:
      position.organizationId != null ? String(position.organizationId) : "",
    orgUnitId: position.orgUnitId != null ? String(position.orgUnitId) : "",
    gradeId: position.gradeId != null ? String(position.gradeId) : "",
    positionLevel: position.positionLevel ?? 1,
    reportsToPositionId:
      position.reportsToPositionId != null
        ? String(position.reportsToPositionId)
        : "",
    descriptionEn: position.descriptionEn ?? "",
    descriptionAr: position.descriptionAr ?? "",
    open: position.open ?? false,
    active: position.active ?? true,
  };
}
