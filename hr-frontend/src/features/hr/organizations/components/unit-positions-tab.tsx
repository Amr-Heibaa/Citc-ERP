import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganizationUnitPositions } from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import { UnitTabToolbar } from "@/features/hr/organizations/components/unit-tab-toolbar";
import { downloadUnitCsv } from "@/features/hr/organizations/utils/organization-unit-export";
import type { UnitPosition } from "@/lib/api/generated/model";

const NO_POSITIONS: UnitPosition[] =
  [];

export function UnitPositionsTab({
  orgUnitId,
}: {
  orgUnitId: number;
}) {
  const { t } = useTranslation();
  const [search, setSearch] =
    useState("");

  const positionsQuery =
    useOrganizationUnitPositions(
      orgUnitId,
    );

  const positions =
    positionsQuery.data ??
    NO_POSITIONS;

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return positions;
    }

    return positions.filter(
      (position) =>
        position.title
          ?.toLowerCase()
          .includes(query) ||
        position.code
          ?.toLowerCase()
          .includes(query) ||
        position.grade
          ?.toLowerCase()
          .includes(query) ||
        position.department
          ?.toLowerCase()
          .includes(query) ||
        position.employee
          ?.toLowerCase()
          .includes(query),
    );
  }, [positions, search]);

  function handleExport() {
    downloadUnitCsv(
      `unit-${orgUnitId}-positions.csv`,
      filtered.map((position) => ({
        "Position Code":
          position.code,
        "Position Title":
          position.title,
        Grade:
          position.grade,
        Department:
          position.department,
        "Reports To":
          position.reportsTo,
        Status:
          position.status,
        Employee:
          position.employee,
      })),
    );
  }

  if (positionsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        {t("organizations.unitPositionsTab.loading")}
      </div>
    );
  }

  if (positionsQuery.isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        {t("organizations.unitPositionsTab.unableToLoad")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <UnitTabToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t("organizations.unitPositionsTab.searchPlaceholder")}
        exportDisabled={
          filtered.length === 0
        }
        onExport={handleExport}
      />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          {t("organizations.unitPositionsTab.noPositionsFound")}
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-[#f4f6f9]">
            <TableRow>
              <TableHead className="px-4">
                {t("organizations.unitPositionsTab.position")}
              </TableHead>

              <TableHead>
                {t("organizations.unitPositionsTab.grade")}
              </TableHead>

              <TableHead>
                {t("organizations.unitPositionsTab.department")}
              </TableHead>

              <TableHead>
                {t("organizations.unitPositionsTab.reportsTo")}
              </TableHead>

              <TableHead>
                {t("common.status")}
              </TableHead>

              <TableHead>
                {t("organizations.unitPositionsTab.employee")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map(
              (position, index) => (
                <TableRow
                  key={
                    position.id ??
                    `${position.code}-${index}`
                  }
                >
                  <TableCell className="px-4">
                    <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                      {position.title ??
                        "—"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {position.code ??
                        "—"}
                    </p>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {position.grade ??
                      "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {position.department ??
                      "—"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {position.reportsTo ??
                      "—"}
                  </TableCell>

                  <TableCell>
                    <OrganizationStatusBadge
                      status={
                        position.status
                      }
                    />
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {position.employee ??
                      t("organizations.unitPositionsTab.openFallback")}
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}