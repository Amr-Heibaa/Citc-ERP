import type { EmployeeSummary } from "@/lib/api/generated/model";

import { formatDate } from "@/features/hr/shared/utils/format";
import {
  downloadCsv,
  downloadExcel,
  escapeHtml,
  printHtmlReport,
} from "@/features/hr/shared/utils/export";

function exportRows(employees: EmployeeSummary[], dateField: "hireDate" | "terminationDate") {
  return employees.map((employee) => ({
    "Employee Number": employee.employeeNumber ?? "",
    Name: employee.displayName ?? "",
    Department: employee.currentOrgUnitName ?? "",
    Position: employee.positionTitle ?? "",
    Status: employee.statusName ?? employee.statusCode ?? "",
    Date: formatDate(employee[dateField]),
  }));
}

export function downloadHiresResignationsCsv(
  hires: EmployeeSummary[],
  resignations: EmployeeSummary[],
) {
  downloadCsv("hires-report", exportRows(hires, "hireDate"));
  downloadCsv("resignations-report", exportRows(resignations, "terminationDate"));
}

export async function downloadHiresResignationsExcel(
  hires: EmployeeSummary[],
  resignations: EmployeeSummary[],
) {
  await downloadExcel("hires-report", exportRows(hires, "hireDate"), "Hires");
  await downloadExcel(
    "resignations-report",
    exportRows(resignations, "terminationDate"),
    "Resignations",
  );
}

export function printHiresResignationsReport(
  hires: EmployeeSummary[],
  resignations: EmployeeSummary[],
  rangeLabel: string,
) {
  const hireHeaders = Object.keys(exportRows(hires, "hireDate")[0] ?? {
    "Employee Number": "", Name: "", Department: "", Position: "", Status: "", Date: "",
  });

  const hireRowsHtml = exportRows(hires, "hireDate")
    .map(
      (row) =>
        `<tr>${hireHeaders.map((h) => `<td>${escapeHtml(row[h as keyof typeof row])}</td>`).join("")}</tr>`,
    )
    .join("");

  const resignationRowsHtml = exportRows(resignations, "terminationDate")
    .map(
      (row) =>
        `<tr>${hireHeaders.map((h) => `<td>${escapeHtml(row[h as keyof typeof row])}</td>`).join("")}</tr>`,
    )
    .join("");

  const headerHtml = hireHeaders.map((h) => `<th>${escapeHtml(h)}</th>`).join("");

  const bodyHtml = `
    <h2 style="margin: 22px 0 8px; font-size: 15px;">Hires (${hires.length})</h2>
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${hireRowsHtml || `<tr><td colspan="${hireHeaders.length}">No hires in this range</td></tr>`}</tbody>
    </table>

    <h2 style="margin: 26px 0 8px; font-size: 15px;">Resignations (${resignations.length})</h2>
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${resignationRowsHtml || `<tr><td colspan="${hireHeaders.length}">No resignations in this range</td></tr>`}</tbody>
    </table>
  `;

  printHtmlReport({
    title: "Hires & Resignations Report",
    subtitle: rangeLabel,
    bodyHtml,
    orientation: "landscape",
  });
}
