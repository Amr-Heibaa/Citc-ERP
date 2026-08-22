import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useOrganizationTree } from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationStructureChart } from "@/features/hr/organizations/components/organization-structure-chart";
import {
  filterOrganizationUnitTree,
  OrganizationUnitTree,
} from "@/features/hr/organizations/components/organization-unit-tree";

export function OrganizationStructureTab({
  organizationId,
}: {
  organizationId: number;
}) {
  const [search, setSearch] = useState("");
  const treeQuery = useOrganizationTree(organizationId);

  const filteredUnits = useMemo(
    () =>
      filterOrganizationUnitTree(
        treeQuery.data?.units ?? [],
        search,
      ),
    [search, treeQuery.data?.units],
  );

  if (treeQuery.isLoading) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        Loading organization structure…
      </div>
    );
  }

  if (treeQuery.isError || !treeQuery.data) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-red-600">
        Unable to load organization structure.
      </div>
    );
  }

  const organizationName =
    treeQuery.data.nameEn ??
    treeQuery.data.code ??
    "Organization";

  return (
    <div className="py-4">
      <div className="mb-4">
        <h2 className="font-['Inter',sans-serif] text-base font-semibold text-[#1a2535]">
          Organization Structure
        </h2>

        <p className="font-['Inter',sans-serif] text-xs text-gray-400">
          Visualize and manage the organization hierarchy
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-xl border border-gray-100 bg-[#f8f9fb] p-3">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <Search className="size-4 shrink-0 text-gray-400" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search units"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {filteredUnits.length > 0 ? (
            <OrganizationUnitTree
              organizationName={organizationName}
              units={filteredUnits}
            />
          ) : (
            <p className="py-8 text-center text-xs text-gray-400">
              No matching units.
            </p>
          )}
        </div>

        <OrganizationStructureChart tree={treeQuery.data} />
      </div>
    </div>
  );
}