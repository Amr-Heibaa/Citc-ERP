import { useMemo, useState } from "react";
import { AlertCircle, Download, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployees } from "@/features/hr/api/use-employees";
import type { EmployeeSummary } from "@/lib/api/hr-api";

type ExportFormat = "CSV" | "Excel" | "PDF";

const AVATAR_COLORS = [
  "bg-[#f5841f]",
  "bg-[#3498db]",
  "bg-[#9b59b6]",
  "bg-[#2ecc71]",
];

function statusClass(code: string | null) {
  if (code === "ACTIVE") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (code === "TERMINATED") {
    return "bg-red-100 text-red-700";
  }

  if (code === "ON_LEAVE") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-gray-200 text-gray-600";
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB");
}

function initials(name: string | null) {
  if (!name) {
    return "NA";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function exportRows(employees: EmployeeSummary[]) {
  return employees.map((employee) => ({
    "Employee Number": employee.employeeNumber,
    Name: employee.displayName ?? "",
    Email: employee.businessEmail ?? employee.personalEmail ?? "",
    Mobile: employee.mobileNumber ?? "",
    Department: employee.currentOrgUnitName ?? "",
    Position: employee.positionTitle ?? "",
    Status: employee.statusName ?? employee.statusCode ?? "",
    "Join Date": formatDate(employee.startDate),
  }));
}

function downloadCsv(employees: EmployeeSummary[]) {
  const rows = exportRows(employees);
  const headers = Object.keys(rows[0] ?? {});

  const escapeCell = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCell(row[header as keyof typeof row]))
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printEmployees(employees: EmployeeSummary[]) {
  const rows = exportRows(employees);

  const printWindow = window.open("", "_blank", "width=1100,height=750");

  if (!printWindow) {
    throw new Error("Allow pop-ups to export PDF");
  }

  printWindow.opener = null;

  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${Object.values(row)
          .map((value) => `<td>${escapeHtml(value)}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  const headers = Object.keys(rows[0] ?? {})
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Employees</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #1a2535;
          }

          h1 {
            margin: 0 0 6px;
          }

          p {
            margin: 0 0 22px;
            color: #6b7280;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th,
          td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }

          th {
            background: #1a2535;
            color: white;
          }

          tr:nth-child(even) {
            background: #f4f6f9;
          }

          @page {
            size: landscape;
            margin: 12mm;
          }
        </style>
      </head>

      <body>
        <h1>Employees</h1>
        <p>${employees.length} employee records</p>

        <table>
          <thead>
            <tr>${headers}</tr>
          </thead>

          <tbody>
            ${bodyRows}
          </tbody>
        </table>

        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        <\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
}

function EmployeeRow({
  employee,
  onSelect,
}: {
  employee: EmployeeSummary;
  onSelect: () => void;
}) {
  const avatarColor = AVATAR_COLORS[employee.employeeId % AVATAR_COLORS.length];

  function handleKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <tr
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-[#f4f6f9] focus:bg-[#f4f6f9] focus:outline-none"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${avatarColor}`}
          >
            {employee.profilePhotoDataUrl ? (
              <img
                src={employee.profilePhotoDataUrl}
                alt={employee.displayName ?? "Employee"}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-['Inter',sans-serif] text-sm font-bold text-white">
                {initials(employee.displayName)}
              </span>
            )}
          </div>

          <div>
            <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
              {employee.displayName ?? "Unnamed employee"}
            </p>

            <p className="font-['Inter',sans-serif] text-xs text-gray-400">
              {employee.employeeNumber}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="max-w-[220px] truncate font-['Inter',sans-serif] text-xs text-gray-500">
          {employee.businessEmail ?? employee.personalEmail ?? "—"}
        </p>

        <p className="font-['Inter',sans-serif] text-xs text-gray-500">
          {employee.mobileNumber ?? "—"}
        </p>
      </td>

      <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.currentOrgUnitName ?? "—"}
      </td>

      <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-600">
        {employee.positionTitle ?? "—"}
      </td>

      <td className="px-4 py-4">
        <Badge className={`border-0 ${statusClass(employee.statusCode)}`}>
          {employee.statusName ?? employee.statusCode ?? "—"}
        </Badge>
      </td>

      <td className="px-4 py-4 font-['Inter',sans-serif] text-sm text-gray-500">
        {formatDate(employee.startDate)}
      </td>
    </tr>
  );
}

export function EmployeesPage() {
  const navigate = useNavigate();
  const employeesQuery = useEmployees();
  const employees = employeesQuery.data ?? [];

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const [exportOpen, setExportOpen] = useState(false);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");

  const departments = useMemo(() => {
    const values = employees
      .map((employee) => employee.currentOrgUnitName)
      .filter((value): value is string => Boolean(value));

    return [...new Set(values)].sort();
  }, [employees]);

  const statuses = useMemo(() => {
    const map = new Map<string, string>();

    employees.forEach((employee) => {
      if (employee.statusCode) {
        map.set(
          employee.statusCode,
          employee.statusName ?? employee.statusCode,
        );
      }
    });

    return [...map.entries()].sort((first, second) =>
      first[1].localeCompare(second[1]),
    );
  }, [employees]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.displayName?.toLowerCase().includes(query) ||
        employee.employeeNumber.toLowerCase().includes(query) ||
        employee.businessEmail?.toLowerCase().includes(query) ||
        employee.personalEmail?.toLowerCase().includes(query);

      const matchesDepartment =
        !department || employee.currentOrgUnitName === department;

      const matchesStatus = !status || employee.statusCode === status;

      return Boolean(matchesSearch && matchesDepartment && matchesStatus);
    });
  }, [department, employees, search, status]);

  async function handleExport() {
    if (filtered.length === 0) {
      toast.error("There are no employees to export");
      return;
    }

    try {
      if (exportFormat === "CSV") {
        downloadCsv(filtered);
      } else if (exportFormat === "Excel") {
        const XLSX = await import("xlsx");

        const sheet = XLSX.utils.json_to_sheet(exportRows(filtered));

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, sheet, "Employees");

        XLSX.writeFile(
          workbook,
          `employees-${new Date().toISOString().slice(0, 10)}.xlsx`,
        );
      } else {
        printEmployees(filtered);
      }

      setExportOpen(false);

      toast.success(`${filtered.length} employees exported`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to export employees";

      toast.error(message);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
              Employees
            </h1>

            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              Manage and view all employee information
            </p>
          </div>

          <Button
            onClick={() => navigate("/hr/employees/new")}
            className="h-10 bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            Add Employee
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2.5">
            <Search size={16} className="shrink-0 text-gray-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for name, ID or email..."
              className="min-w-0 flex-1 bg-transparent font-['Inter',sans-serif] text-sm text-gray-600 outline-none placeholder:text-gray-400"
            />
          </div>

          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 font-['Inter',sans-serif] text-sm text-gray-600 outline-none"
          >
            <option value="">All Departments</option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 font-['Inter',sans-serif] text-sm text-gray-600 outline-none"
          >
            <option value="">All Status</option>

            {statuses.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          <Button
            onClick={() => setExportOpen(true)}
            disabled={employeesQuery.isLoading || filtered.length === 0}
            className="h-10 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            <Download size={15} />
            Export
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {employeesQuery.isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="size-9 text-red-400" />

              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                  Unable to load employees
                </p>

                <p className="font-['Inter',sans-serif] text-sm text-gray-400">
                  Check the server connection and try again.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => employeesQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Try again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "Employee",
                      "Contact",
                      "Department",
                      "Position",
                      "Status",
                      "Join Date",
                    ].map((label) => (
                      <th
                        key={label}
                        className={`${
                          label === "Employee" ? "px-6" : "px-4"
                        } py-4 text-left font-['Inter',sans-serif] text-sm font-semibold text-gray-600`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {employeesQuery.isLoading ? (
                    Array.from({ length: 6 }, (_, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center font-['Inter',sans-serif] text-sm text-gray-400"
                      >
                        No employees match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((employee) => (
                      <EmployeeRow
                        key={employee.employeeId}
                        employee={employee}
                        onSelect={() =>
                          navigate(`/hr/employees/${employee.employeeId}`)
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!employeesQuery.isError && (
            <div className="border-t border-gray-100 px-6 py-3 font-['Inter',sans-serif] text-xs text-gray-400">
              Showing {filtered.length} of {employees.length}
            </div>
          )}
        </div>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>Export Employees</DialogTitle>

            <DialogDescription>
              Export {filtered.length} employee records using your preferred
              format.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            {(["CSV", "Excel", "PDF"] as ExportFormat[]).map((format) => (
              <label
                key={format}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                  exportFormat === format
                    ? "border-[#f5841f] bg-orange-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="export-format"
                  checked={exportFormat === format}
                  onChange={() => setExportFormat(format)}
                  className="accent-[#f5841f]"
                />

                <div>
                  <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                    {format}
                  </p>

                  <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                    {format === "CSV"
                      ? "Comma-separated values"
                      : format === "Excel"
                        ? "Microsoft Excel workbook"
                        : "Open a print-ready view to save as PDF"}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={handleExport}
              className="bg-[#1a2535] text-white hover:bg-[#243347]"
            >
              <Download className="size-4" />
              Export {exportFormat}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
