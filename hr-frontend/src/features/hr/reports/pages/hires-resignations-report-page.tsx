import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/features/hr/shared/utils/format";
import { useEmployeesForReport } from "@/features/hr/reports/api/use-reports";
import {
  downloadHiresResignationsCsv,
  downloadHiresResignationsExcel,
  printHiresResignationsReport,
} from "@/features/hr/reports/utils/hires-resignations-report-export";
import type { EmployeeSummary } from "@/lib/api/generated/model";

function inRange(date: string | null | undefined, from: string, to: string) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function EmployeeRow({ employee, date }: { employee: EmployeeSummary; date: string | undefined }) {
  return (
    <TableRow>
      <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
        {employee.employeeNumber}
      </TableCell>

      <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.displayName}
      </TableCell>

      <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.currentOrgUnitName ?? "—"}
      </TableCell>

      <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.positionTitle ?? "—"}
      </TableCell>

      <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
        {formatDate(date)}
      </TableCell>
    </TableRow>
  );
}

function ReportTable({
  employees,
  dateField,
  emptyLabel,
}: {
  employees: EmployeeSummary[];
  dateField: "hireDate" | "terminationDate";
  emptyLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {employees.length === 0 ? (
        <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
          {emptyLabel}
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-[#f4f6f9]">
            <TableRow>
              <TableHead>Employee Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {employees.map((employee) => (
              <EmployeeRow key={employee.employeeId} employee={employee} date={employee[dateField]} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function defaultRange() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return { today, monthAgo };
}

export function HiresResignationsReportPage() {
  const [{ today, monthAgo }] = useState(defaultRange);

  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [exporting, setExporting] = useState(false);

  const query = useEmployeesForReport();
  const employees = useMemo(() => query.data ?? [], [query.data]);

  const hires = useMemo(
    () => employees.filter((e) => inRange(e.hireDate, from, to)),
    [employees, from, to],
  );

  const resignations = useMemo(
    () => employees.filter((e) => inRange(e.terminationDate, from, to)),
    [employees, from, to],
  );

  const rangeLabel = `${formatDate(from)} — ${formatDate(to)}`;
  const hasResults = hires.length > 0 || resignations.length > 0;

  async function handleExcel() {
    setExporting(true);
    try {
      await downloadHiresResignationsExcel(hires, resignations);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            Hires & Resignations Report
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            {hires.length} hires · {resignations.length} resignations in the selected range
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadHiresResignationsCsv(hires, resignations)}
            disabled={!hasResults}
          >
            <Download className="size-4" />
            CSV
          </Button>

          <Button variant="outline" onClick={handleExcel} disabled={!hasResults || exporting}>
            <FileSpreadsheet className="size-4" />
            Excel
          </Button>

          <Button
            onClick={() => printHiresResignationsReport(hires, resignations, rangeLabel)}
            disabled={!hasResults}
            className="bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            <FileText className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="font-['Inter',sans-serif] text-xs font-medium text-gray-500">
            From
          </span>
          <Input
            type="date"
            value={from}
            max={to}
            onChange={(event) => setFrom(event.target.value)}
            className="w-44"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-['Inter',sans-serif] text-xs font-medium text-gray-500">
            To
          </span>
          <Input
            type="date"
            value={to}
            min={from}
            onChange={(event) => setTo(event.target.value)}
            className="w-44"
          />
        </label>
      </div>

      {query.isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-100 bg-white font-['Inter',sans-serif] text-sm text-gray-400">
          Loading employees…
        </div>
      ) : query.isError ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-100 bg-white font-['Inter',sans-serif] text-sm text-red-600">
          Unable to load employees.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="font-['Inter',sans-serif] text-base font-bold text-[#1a2535]">
              Hires ({hires.length})
            </h2>
            <ReportTable employees={hires} dateField="hireDate" emptyLabel="No hires in this range." />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-['Inter',sans-serif] text-base font-bold text-[#1a2535]">
              Resignations ({resignations.length})
            </h2>
            <ReportTable employees={resignations} dateField="terminationDate" emptyLabel="No resignations in this range." />
          </div>
        </>
      )}
    </div>
  );
}
