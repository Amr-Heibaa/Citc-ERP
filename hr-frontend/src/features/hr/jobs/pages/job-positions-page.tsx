import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo } from "react";
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
import { useJobPositions } from "@/features/hr/jobs/api/use-job-positions";
import { JobPositionsFiltersBar } from "@/features/hr/jobs/components/job-positions-filters-bar";
import { JobStatusBadge } from "@/features/hr/jobs/components/job-status-badge";
import { useJobPositionsFiltersStore } from "@/features/hr/jobs/store/job-positions-filters-store";
import { downloadJobPositionsCsv } from "@/features/hr/jobs/utils/job-position-export";
import type { ListPositionsParams } from "@/lib/api/generated/model";

export function JobPositionsPage() {
  const navigate = useNavigate();

  const search = useJobPositionsFiltersStore((state) => state.search);
  const organizationId = useJobPositionsFiltersStore((state) => state.organizationId);
  const orgUnitId = useJobPositionsFiltersStore((state) => state.orgUnitId);
  const gradeId = useJobPositionsFiltersStore((state) => state.gradeId);
  const status = useJobPositionsFiltersStore((state) => state.status);
  const occupancy = useJobPositionsFiltersStore((state) => state.occupancy);
  const page = useJobPositionsFiltersStore((state) => state.page);
  const setPage = useJobPositionsFiltersStore((state) => state.setPage);

  const params = useMemo<ListPositionsParams>(
    () => ({
      search: search.trim() || undefined,
      organizationId: organizationId ? Number(organizationId) : undefined,
      orgUnitId: orgUnitId ? Number(orgUnitId) : undefined,
      gradeId: gradeId ? Number(gradeId) : undefined,
      active: status ? status === "active" : undefined,
      occupied: occupancy === "occupied" ? true : undefined,
      open: occupancy === "open" ? true : undefined,
      page,
      size: 20,
    }),
    [search, organizationId, orgUnitId, gradeId, status, occupancy, page],
  );

  const positions = useJobPositions(params);
  const rows = positions.data?.content ?? [];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/hr/jobs")}
            className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back to Jobs
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            Job Positions
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            All organizational positions and their occupancy.
          </p>
        </div>

        <Button onClick={() => navigate("/hr/jobs/positions/new")}>
          <Plus className="size-4" />
          Add Position
        </Button>
      </div>

      <JobPositionsFiltersBar
        onExport={() => downloadJobPositionsCsv(rows)}
        exportDisabled={rows.length === 0}
      />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {positions.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            Loading positions…
          </div>
        ) : positions.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            Unable to load job positions.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            No positions found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Job Grade</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Current Employee</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((position) => (
                <TableRow
                  key={position.positionId}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/hr/jobs/positions/${position.positionId}`)
                  }
                >
                  <TableCell>
                    <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                      {position.titleEn}
                    </p>

                    <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                      {position.code}
                    </p>
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {position.gradeCode ?? "—"}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {position.orgUnitName ?? "—"}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {position.assignedEmployeeName ?? "—"}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {position.occupancyStatus ?? "—"}
                  </TableCell>

                  <TableCell>
                    <JobStatusBadge active={position.active ?? false} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {positions.data && positions.data.totalPages != null && positions.data.totalPages > 1 && (
        <div className="flex items-center justify-between font-['Inter',sans-serif] text-sm text-gray-500">
          <span>
            Page {(positions.data.page ?? 0) + 1} of {positions.data.totalPages}
            {" · "}
            {positions.data.totalElements} positions
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={positions.data.first}
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={positions.data.last}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
