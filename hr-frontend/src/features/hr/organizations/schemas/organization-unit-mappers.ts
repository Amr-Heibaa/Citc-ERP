import {
  ROOT_UNIT_VALUE,
  type OrganizationUnitFormValues,
} from "@/features/hr/organizations/schemas/organization-unit-schema";
import type {
  CreateOrganizationUnitRequest,
  OrganizationUnitDetail,
  UpdateOrganizationUnitRequest,
} from "@/lib/api/generated/model";

function optionalText(
  value?: string,
): string | undefined {
  const normalized =
    value?.trim();

  return normalized || undefined;
}

function optionalUnitId(
  value: string,
): number | undefined {
  if (
    !value ||
    value === ROOT_UNIT_VALUE
  ) {
    return undefined;
  }

  const id = Number(value);

  return Number.isInteger(id) &&
    id > 0
    ? id
    : undefined;
}

function requestValues(
  values: OrganizationUnitFormValues,
) {
  return {
    code: values.code.trim(),
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr.trim(),
    unitTypeId: Number(
      values.unitTypeId,
    ),
    parentOrgUnitId:
      optionalUnitId(
        values.parentOrgUnitId,
      ),
    description:
      optionalText(
        values.description,
      ),
    descriptionAr:
      optionalText(
        values.descriptionAr,
      ),
    startDate:
      values.startDate,
    endDate:
      optionalText(
        values.endDate,
      ),
    active: values.active,
  };
}

export function toCreateOrganizationUnitRequest(
  values: OrganizationUnitFormValues,
): CreateOrganizationUnitRequest {
  return requestValues(values);
}

export function toUpdateOrganizationUnitRequest(
  values: OrganizationUnitFormValues,
): UpdateOrganizationUnitRequest {
  return requestValues(values);
}

export function organizationUnitToFormValues(
  unit?: OrganizationUnitDetail,
  fixedParentUnitId?: number,
): OrganizationUnitFormValues {
  const parentId =
    fixedParentUnitId ??
    unit?.parentUnitId;

  return {
    code: unit?.code ?? "",
    nameEn: unit?.name ?? "",
    nameAr: unit?.nameAr ?? "",
    unitTypeId:
      unit?.unitTypeId != null
        ? String(unit.unitTypeId)
        : "",
    parentOrgUnitId:
      parentId != null
        ? String(parentId)
        : ROOT_UNIT_VALUE,
    description:
      unit?.description ?? "",
    descriptionAr:
      unit?.descriptionAr ?? "",
    startDate:
      unit?.startDate ??
      new Date()
        .toISOString()
        .slice(0, 10),
    endDate:
      unit?.endDate ?? "",
    active:
      unit?.status
        ?.toLowerCase() !==
      "inactive",
  };
}