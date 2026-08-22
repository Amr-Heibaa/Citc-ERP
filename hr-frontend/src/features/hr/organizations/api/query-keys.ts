import {
  getGetOrganizationDetailQueryKey,
  getListOrganizationsQueryKey,
} from "@/lib/api/generated/ems/organization-controller/organization-controller";

import {
  getGetOrganizationTreeQueryKey,
  getGetUnitDetailQueryKey,
  getListChildUnitsQueryKey,
  getListOrganizationUnitsQueryKey,
} from "@/lib/api/generated/ems/organization-unit-controller/organization-unit-controller";

import {
  getEmployeesQueryKey,
  getHistoryQueryKey,
  getPositionsQueryKey,
  getRelationshipsQueryKey,
} from "@/lib/api/generated/ems/organization-unit-tabs-controller/organization-unit-tabs-controller";

const ORGANIZATION_PREFIX = "/api/hr/organizations";
const ORGANIZATION_UNIT_PREFIX = "/api/hr/units";

export const organizationListQueryKey =
  getListOrganizationsQueryKey;

export const organizationDetailQueryKey =
  getGetOrganizationDetailQueryKey;

export const organizationTreeQueryKey =
  getGetOrganizationTreeQueryKey;

export const organizationUnitsQueryKey =
  getListOrganizationUnitsQueryKey;

export const organizationUnitDetailQueryKey =
  getGetUnitDetailQueryKey;

export const organizationUnitChildrenQueryKey =
  getListChildUnitsQueryKey;

export const organizationUnitEmployeesQueryKey =
  getEmployeesQueryKey;

export const organizationUnitPositionsQueryKey =
  getPositionsQueryKey;

export const organizationUnitRelationshipsQueryKey =
  getRelationshipsQueryKey;

export const organizationUnitHistoryQueryKey =
  getHistoryQueryKey;

function firstQueryKeyPart(
  queryKey: readonly unknown[],
): string | null {
  const [first] = queryKey;

  return typeof first === "string"
    ? first
    : null;
}

export function isOrganizationQueryKey(
  queryKey: readonly unknown[],
): boolean {
  const first = firstQueryKeyPart(queryKey);

  return first?.startsWith(
    ORGANIZATION_PREFIX,
  ) ?? false;
}

export function isOrganizationUnitQueryKey(
  queryKey: readonly unknown[],
): boolean {
  const first = firstQueryKeyPart(queryKey);

  return first?.startsWith(
    ORGANIZATION_UNIT_PREFIX,
  ) ?? false;
}

export function isOrganizationDomainQueryKey(
  queryKey: readonly unknown[],
): boolean {
  return (
    isOrganizationQueryKey(queryKey) ||
    isOrganizationUnitQueryKey(queryKey)
  );
}