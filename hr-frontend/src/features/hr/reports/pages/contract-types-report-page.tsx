import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/features/hr/shared/components/status-badge";
import { useContractTypesForReport } from "@/features/hr/reports/api/use-reports";
import {
  downloadContractTypesCsv,
  downloadContractTypesExcel,
  printContractTypesReport,
} from "@/features/hr/reports/utils/contract-types-report-export";

export function ContractTypesReportPage() {
  const [exporting, setExporting] = useState(false);

  const query = useContractTypesForReport();
  const rows = query.data?.content ?? [];

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
            Contract Types Report
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            {rows.length} contract types · {totalContracts} contracts in total
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadContractTypesCsv(sortedRows)} disabled={rows.length === 0}>
            <Download className="size-4" />
            CSV
          </Button>

          <Button variant="outline" onClick={handleExcel} disabled={rows.length === 0 || exporting}>
            <FileSpreadsheet className="size-4" />
            Excel
          </Button>

          <Button onClick={() => printContractTypesReport(sortedRows)} disabled={rows.length === 0} className="bg-[#1a2535] text-white hover:bg-[#243347]">
            <FileText className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {query.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            Loading contract types…
          </div>
        ) : query.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            Unable to load contract types.
          </div>
        ) : sortedRows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            No contract types found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-1/3">Distribution</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
