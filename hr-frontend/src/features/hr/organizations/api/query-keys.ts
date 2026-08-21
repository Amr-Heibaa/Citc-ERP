import { getGetOrganizationDetailQueryKey } from "@/lib/api/generated/ems/organization-controller/organization-controller";

const ORGANIZATION_PREFIX = "/api/hr/organizations";

export const organizationDetailQueryKey = getGetOrganizationDetailQueryKey;

export function isOrganizationQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(ORGANIZATION_PREFIX);
}
