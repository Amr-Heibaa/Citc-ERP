import { Download, FileSpreadsheet, FileText, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { formatDate } from "@/features/hr/shared/utils/format";
import { printTableReport } from "@/features/hr/shared/utils/export";
import {
  useAllEmployeeDetailsForReport,
  useContractTypesForReport,
} from "@/features/hr/reports/api/use-reports";
import {
  downloadContractTypesCsv,
  downloadContractTypesExcel,
  printContractTypesReport,
} from "@/features/hr/reports/utils/contract-types-report-export";
import type { ContractTypeSetting } from "@/lib/api/generated/model";

function ContractTypeEmployeesDialog({
  contractType,
  onClose,
}: {
  contractType: ContractTypeSetting | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const details = useAllEmployeeDetailsForReport();

  const employees = useMemo(() => {
    if (!contractType) return [];

    return (details.data ?? []).filter((emp) =>
      (emp.contracts ?? []).some(
        (contract) =>
          contract.contractTypeId === contractType.contractTypeId &&
          contract.active,
      ),
    );
  }, [details.data, contractType]);

  function handlePrint() {
    if (!contractType) return;

    printTableReport({
      title: t("reports.contractTypesReport.employeesDialog.title", {
        name: contractType.name,
      }),
      subtitle: t("reports.contractTypesReport.employeesDialog.summary", {
        count: employees.length,
      }),
      rows: employees.map((emp) => ({
        [t("reports.contractTypesReport.columns.employeeNumber")]: emp.employeeNumber ?? "",
        [t("reports.contractTypesReport.columns.name")]: emp.displayName ?? "",
        [t("reports.contractTypesReport.columns.position")]: emp.positionTitle ?? "",
        [t("reports.contractTypesReport.columns.department")]: emp.department ?? "",
        [t("reports.contractTypesReport.columns.hireDate")]: formatDate(emp.hireDate),
      })),
    });
  }

  return (
    <Dialog open={contractType != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            {t("reports.contractTypesReport.employeesDialog.title", {
              name: contractType?.name ?? "",
            })}
          </DialogTitle>

          <DialogDescription>
            {t("reports.contractTypesReport.employeesDialog.summary", {
              count: employees.length,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {details.isLoading ? (
            <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("reports.contractTypesReport.loading")}
            </div>
          ) : employees.length === 0 ? (
            <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("reports.contractTypesReport.employeesDialog.noEmployees")}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#f4f6f9]">
                <TableRow>
                  <TableHead>{t("reports.contractTypesReport.columns.employeeNumber")}</TableHead>
                  <TableHead>{t("reports.contractTypesReport.columns.name")}</TableHead>
                  <TableHead>{t("reports.contractTypesReport.columns.position")}</TableHead>
                  <TableHead>{t("reports.contractTypesReport.columns.hireDate")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                      {emp.employeeNumber}
                    </TableCell>
                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {emp.displayName}
                    </TableCell>
                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {emp.positionTitle ?? "—"}
                    </TableCell>
                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(emp.hireDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={employees.length === 0}
          >
            <FileText className="size-4" />
            {t("reports.contractTypesReport.pdf")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ContractTypesReportPage() {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [selectedType, setSelectedType] = useState<ContractTypeSetting | null>(null);

  const query = useContractTypesForReport();
  const rows = query.data ?? [];

  const sortedRows = [...rows].sort(
    (a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0),
  );

  const totalContracts = rows.reduce((sum, row) => sum + (row.usageCount ?? 0), 0);
  const maxUsage = Math.max(1, ...rows.map((row) => row.usageCount ?? 0));

  async function handleExcel() {
    setExporting(true);
    try {
      await downloadContractTypesExcel(sortedRows);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {t("reports.contractTypesReport.title")}
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            {t("reports.contractTypesReport.summary", { count: rows.length, total: totalContracts })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadContractTypesCsv(sortedRows)} disabled={rows.length === 0}>
            <Download className="size-4" />
            {t("reports.contractTypesReport.csv")}
          </Button>

          <Button variant="outline" onClick={handleExcel} disabled={rows.length === 0 || exporting}>
            <FileSpreadsheet className="size-4" />
            {t("reports.contractTypesReport.excel")}
          </Button>

          <Button onClick={() => printContractTypesReport(sortedRows)} disabled={rows.length === 0} className="bg-[#1a2535] text-white hover:bg-[#243347]">
            <FileText className="size-4" />
            {t("reports.contractTypesReport.pdf")}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {query.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("reports.contractTypesReport.loading")}
          </div>
        ) : query.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            {t("reports.contractTypesReport.unableToLoad")}
          </div>
        ) : sortedRows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("reports.contractTypesReport.noResults")}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>{t("reports.contractTypesReport.columns.code")}</TableHead>
                <TableHead>{t("reports.contractTypesReport.columns.name")}</TableHead>
                <TableHead>{t("reports.contractTypesReport.columns.status")}</TableHead>
                <TableHead>{t("reports.contractTypesReport.columns.usage")}</TableHead>
                <TableHead className="w-1/3">
                  {t("reports.contractTypesReport.columns.distribution")}
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedRows.map((row) => (
                <TableRow key={row.contractTypeId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {row.code}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {row.name}
                  </TableCell>

                  <TableCell>
                    <StatusBadge active={row.active ?? false} />
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                    {row.usageCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <div className="h-2 w-full rounded-full bg-[#f4f6f9]">
                      <div
                        className="h-2 rounded-full bg-[#f5841f]"
                        style={{
                          width: `${((row.usageCount ?? 0) / maxUsage) * 100}%`,
                        }}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedType(row)}
                    >
                      <Users className="size-4" />
                      {t("reports.contractTypesReport.viewEmployees")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ContractTypeEmployeesDialog
        contractType={selectedType}
        onClose={() => setSelectedType(null)}
      />
    </div>
  );
}
