import { useState } from "react";
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
import { useDeletedEmployees } from "@/features/hr/employees/api/use-employees";
import { RestoreEmployeeDialog } from "@/features/hr/employees/components/restore-employee-dialog";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { DeletedEmployeeSummary } from "@/lib/api/generated/model";

export function DeletedEmployeesPage() {
  const navigate = useNavigate();
  const query = useDeletedEmployees();
  const rows = query.data ?? [];

  const [restoreTarget, setRestoreTarget] = useState<DeletedEmployeeSummary>();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/hr/employees")}
            className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
          >
            ← Employees
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            Deleted Employees
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            {rows.length} deleted employee records
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {query.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            Loading deleted employees…
          </div>
        ) : query.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            Unable to load deleted employees.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            No deleted employees.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>Employee Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Deleted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {row.employeeNumber}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {row.displayName}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {row.deletionReason ?? "—"}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {formatDate(row.deletedAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreTarget(row)}
                    >
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {restoreTarget && (
        <RestoreEmployeeDialog
          open={Boolean(restoreTarget)}
          onOpenChange={(open) => !open && setRestoreTarget(undefined)}
          employeeId={restoreTarget.employeeId ?? 0}
          employeeName={restoreTarget.displayName ?? "This employee"}
          onRestored={() => setRestoreTarget(undefined)}
        />
      )}
    </div>
  );
}
