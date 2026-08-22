import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  useOrganizationTree,
  useOrganizationUnits,
} from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import {
  filterOrganizationUnitTree,
  OrganizationUnitTree,
} from "@/features/hr/organizations/components/organization-unit-tree";
import { InfoRow } from "@/features/hr/shared/components/info-row";

export function OrganizationUnitTab({
  organizationId,
}: {
  organizationId: number;
}) {
  const [search, setSearch] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<number>();

  const treeQuery = useOrganizationTree(organizationId);

  const unitsQuery = useOrganizationUnits(organizationId);

  const units = unitsQuery.data ?? [];

  const navigate = useNavigate();

  useEffect(() => {
    const selectedStillExists =
      selectedUnitId != null &&
      units.some((unit) => unit.id === selectedUnitId);

    if (!selectedStillExists && units[0]?.id != null) {
      setSelectedUnitId(units[0].id);
    }
  }, [selectedUnitId, units]);

  const selectedUnit = useMemo(
    () => units.find((unit) => unit.id === selectedUnitId),
    [selectedUnitId, units],
  );

  const filteredUnits = useMemo(
    () => filterOrganizationUnitTree(treeQuery.data?.units ?? [], search),
    [search, treeQuery.data?.units],
  );

  if (treeQuery.isLoading || unitsQuery.isLoading) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        Loading organization units…
      </div>
    );
  }

  if (treeQuery.isError || unitsQuery.isError || !treeQuery.data) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-red-600">
        Unable to load organization units.
      </div>
    );
  }

  const organizationName =
    treeQuery.data.nameEn ?? treeQuery.data.code ?? "Organization";

  return (
    <div className="py-4">
      <div className="mb-4">
        <h2 className="font-['Inter',sans-serif] text-base font-semibold text-[#1a2535]">
          Organization Units
        </h2>

        <p className="font-['Inter',sans-serif] text-xs text-gray-400">
          Select a unit to view its information
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

          <OrganizationUnitTree
            organizationName={organizationName}
            units={filteredUnits}
            selectedId={selectedUnitId}
            onSelect={setSelectedUnitId}
          />
        </div>

        <div className="rounded-xl border border-gray-100 bg-[#f8f9fb] p-5">
          {selectedUnit ? (
            <>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-['Inter',sans-serif] text-lg font-semibold text-[#1a2535]">
                    {selectedUnit.name ??
                      selectedUnit.code ??
                      "Organization Unit"}
                  </h3>

                  {selectedUnit.nameAr && (
                    <p
                      dir="rtl"
                      className="mt-1 text-left font-['Inter',sans-serif] text-sm text-gray-400"
                    >
                      {selectedUnit.nameAr}
                    </p>
                  )}
                </div>

                <OrganizationStatusBadge status={selectedUnit.status} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow label="Unit Code" value={selectedUnit.code} />

                <InfoRow label="Unit Type" value={selectedUnit.type} />

                <InfoRow label="Parent Unit" value={selectedUnit.parentUnit} />

                <InfoRow label="Manager" value={selectedUnit.manager} />

                <InfoRow label="Employees" value={selectedUnit.employees} />

                <InfoRow
                  label="Active Positions"
                  value={selectedUnit.activePositions}
                />

                <InfoRow
                  label="Open Positions"
                  value={selectedUnit.openPositions}
                />

                <InfoRow label="Child Units" value={selectedUnit.childUnits} />

                <div className="sm:col-span-2">
                  <InfoRow
                    label="Description"
                    value={selectedUnit.description}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  onClick={() =>
                    navigate(
                      `/hr/organizations/${organizationId}/units/${selectedUnit.id}`,
                    )
                  }
                >
                  Unit Details
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400">
              Select a unit to view its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
