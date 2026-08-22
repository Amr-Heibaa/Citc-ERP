import { ExternalLink, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganizationUnitChildUnits } from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import { UnitTabToolbar } from "@/features/hr/organizations/components/unit-tab-toolbar";
import { downloadUnitCsv } from "@/features/hr/organizations/utils/organization-unit-export";
import type { OrganizationUnitDetail } from "@/lib/api/generated/model";
import { OrganizationUnitFormDialog } from "@/features/hr/organizations/components/organization-unit-form-dialog";

const NO_CHILD_UNITS: OrganizationUnitDetail[] = [];

export function UnitChildUnitsTab({
  organizationId,
  orgUnitId,
}: {
  organizationId: number;
  orgUnitId: number;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [addChildUnitOpen, setAddChildUnitOpen] = useState(false);

  const childUnitsQuery = useOrganizationUnitChildUnits(orgUnitId);

  const childUnits = childUnitsQuery.data ?? NO_CHILD_UNITS;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return childUnits;
    }

    return childUnits.filter(
      (unit) =>
        unit.name?.toLowerCase().includes(query) ||
        unit.nameAr?.toLowerCase().includes(query) ||
        unit.code?.toLowerCase().includes(query) ||
        unit.type?.toLowerCase().includes(query) ||
        unit.manager?.toLowerCase().includes(query),
    );
  }, [childUnits, search]);

  function handleExport() {
    downloadUnitCsv(
      `unit-${orgUnitId}-child-units.csv`,
      filtered.map((unit) => ({
        "Unit Code": unit.code,
        "Unit Name": unit.name,
        "Arabic Name": unit.nameAr,
        "Unit Type": unit.type,
        Manager: unit.manager,
        Employees: unit.employees,
        "Active Positions": unit.activePositions,
        Status: unit.status,
      })),
    );
  }

  if (childUnitsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading child units…
      </div>
    );
  }

  if (childUnitsQuery.isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        Unable to load child units.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <UnitTabToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search child units..."
          exportDisabled={filtered.length === 0}
          onExport={handleExport}
        >
          <Button
            onClick={() => setAddChildUnitOpen(true)}
            className="gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            <Plus className="size-4" />
            Add Child Unit
          </Button>
        </UnitTabToolbar>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No child units found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead className="px-4">Unit</TableHead>

                <TableHead>Unit Type</TableHead>

                <TableHead>Manager</TableHead>

                <TableHead>Employees</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((unit, index) => (
                <TableRow key={unit.id ?? `${unit.code}-${index}`}>
                  <TableCell className="px-4">
                    <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                      {unit.name ?? "—"}
                    </p>

                    <p className="text-xs text-gray-400">{unit.code ?? "—"}</p>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {unit.type ?? "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {unit.manager ?? "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {unit.employees ?? 0}
                  </TableCell>

                  <TableCell>
                    <OrganizationStatusBadge status={unit.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={unit.id == null}
                      title="Open unit details"
                      onClick={() => {
                        if (unit.id == null) {
                          return;
                        }

                        navigate(
                          `/hr/organizations/${organizationId}/units/${unit.id}`,
                        );
                      }}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <OrganizationUnitFormDialog
        open={addChildUnitOpen}
        onOpenChange={setAddChildUnitOpen}
        organizationId={organizationId}
        mode="create"
        fixedParentUnitId={orgUnitId}
      />
    </>
  );
}
