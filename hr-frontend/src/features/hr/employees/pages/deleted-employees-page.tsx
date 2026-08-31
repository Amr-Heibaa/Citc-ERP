import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            {t("employees.backToEmployees")}
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {t("employees.deletedEmployees")}
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            {t("employees.deletedEmployeesSubtitle", { count: rows.length })}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {query.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("employees.table.loadingDeleted")}
          </div>
        ) : query.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            {t("employees.table.unableToLoadDeleted")}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("employees.table.noDeletedEmployees")}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>{t("employees.table.employeeNumber")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("employees.table.reason")}</TableHead>
                <TableHead>{t("employees.table.deletedAt")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
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
                      {t("employees.restore")}
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
          employeeName={restoreTarget.displayName ?? t("employees.thisEmployee")}
          onRestored={() => setRestoreTarget(undefined)}
        />
      )}
    </div>
  );
}
