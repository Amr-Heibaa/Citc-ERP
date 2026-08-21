import type { EmployeeSummary } from "@/lib/api/generated/model";

import { formatDate } from "@/features/hr/shared/utils/format";

export function exportRows(employees: EmployeeSummary[]) {
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

export function downloadCsv(employees: EmployeeSummary[]) {
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

  const blob = new Blob(["﻿", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadExcel(employees: EmployeeSummary[]) {
  const XLSX = await import("xlsx");

  const sheet = XLSX.utils.json_to_sheet(exportRows(employees));

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, sheet, "Employees");

  XLSX.writeFile(
    workbook,
    `employees-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function printEmployees(employees: EmployeeSummary[]) {
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

  // The escaped "<\/script>" below is intentional: it keeps this template
  // literal from containing a literal "</script>" sequence, which could
  // otherwise prematurely close the surrounding <script> tag if this file
  // is ever bundled inline into an HTML document.
  /* eslint-disable no-useless-escape */
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
  /* eslint-enable no-useless-escape */

  printWindow.document.close();
}
