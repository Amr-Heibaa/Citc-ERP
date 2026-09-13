import { useQueries } from "@tanstack/react-query";

import { useOrganizations } from "@/features/hr/organizations/api/use-organizations";
import { organizationUnitsQueryKey } from "@/features/hr/organizations/api/query-keys";
import { listOrganizationUnits } from "@/lib/api/generated/ems/organization-unit-controller/organization-unit-controller";

function isValidId(value: number | undefined): value is number {
  return Number.isInteger(value) && (value ?? 0) > 0;
}

// Flattens every unit across every organization into one list, each unit
// carrying its own type/parent so branch resolution can walk the tree
// without needing to know which organization a unit belongs to.
export function useAllOrganizationUnits() {
  const organizations = useOrganizations();

  const organizationIds = (organizations.data ?? [])
    .map((org) => org.id)
    .filter(isValidId);

  const unitQueries = useQueries({
    queries: organizationIds.map((organizationId) => ({
      queryKey: organizationUnitsQueryKey(organizationId),
      queryFn: () => listOrganizationUnits(organizationId),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = organizations.isLoading || unitQueries.some((query) => query.isLoading);
  const units = unitQueries.flatMap((query) => query.data ?? []);

  return { units, isLoading };
}
