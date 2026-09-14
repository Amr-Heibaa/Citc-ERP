import type { EmployeeDetail } from "@/lib/api/generated/model";

import i18n from "@/i18n";
import { formatDate } from "@/features/hr/shared/utils/format";
import {
  downloadCsv,
  downloadExcel,
  escapeHtml,
  printHtmlReport,
} from "@/features/hr/shared/utils/export";

export const RETIREMENT_AGE = 60;

type EmployeeWithAge = EmployeeDetail & { age: number | null };

function isRetirementAge(employee: EmployeeWithAge) {
  return (employee.age ?? 0) >= RETIREMENT_AGE;
}

function exportRows(employees: EmployeeWithAge[]) {
  return employees.map((employee) => ({
    [i18n.t("reports.ageGroupsReport.columns.employeeNumber")]: employee.employeeNumber ?? "",
    [i18n.t("reports.ageGroupsReport.columns.name")]: employee.displayName ?? "",
    [i18n.t("reports.ageGroupsReport.columns.department")]: employee.department ?? "",
    [i18n.t("reports.ageGroupsReport.columns.position")]: employee.positionTitle ?? "",
    [i18n.t("reports.ageGroupsReport.columns.birthDate")]: formatDate(employee.birthDate),
    [i18n.t("reports.ageGroupsReport.columns.age")]: employee.age ?? "",
    [i18n.t("reports.ageGroupsReport.columns.alert")]: isRetirementAge(employee)
      ? i18n.t("reports.ageGroupsReport.retirementAlert.badge")
      : "",
  }));
}

export function downloadAgeGroupsCsv(employees: EmployeeWithAge[]) {
  downloadCsv("age-groups-report", exportRows(employees));
}

export async function downloadAgeGroupsExcel(employees: EmployeeWithAge[]) {
  await downloadExcel("age-groups-report", exportRows(employees), "Age Groups");
}

export function printAgeGroupsReport(employees: EmployeeWithAge[]) {
  const headers = [
    i18n.t("reports.ageGroupsReport.columns.employeeNumber"),
    i18n.t("reports.ageGroupsReport.columns.name"),
    i18n.t("reports.ageGroupsReport.columns.department"),
    i18n.t("reports.ageGroupsReport.columns.position"),
    i18n.t("reports.ageGroupsReport.columns.birthDate"),
    i18n.t("reports.ageGroupsReport.columns.age"),
  ];

  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");

  const bodyRows = [...employees]
    .sort((a, b) => (b.age ?? 0) - (a.age ?? 0))
    .map((employee) => {
      const retirement = isRetirementAge(employee);

      const cells = [
        employee.employeeNumber ?? "",
        employee.displayName ?? "",
        employee.department ?? "",
        employee.positionTitle ?? "",
        formatDate(employee.birthDate),
        employee.age ?? "",
      ]
        .map((value) => `<td>${escapeHtml(value)}</td>`)
        .join("");

      return `<tr class="${retirement ? "retirement-row" : ""}">${cells}</tr>`;
    })
    .join("");

  const bodyHtml = `
    <style>
      .retirement-row td {
        background: #fee2e2 !important;
        color: #b91c1c;
        font-weight: 700;
      }
    </style>
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;

  printHtmlReport({
    title: i18n.t("reports.ageGroupsReport.title"),
    subtitle: i18n.t("reports.ageGroupsReport.summary", { count: employees.length }),
    bodyHtml,
    orientation: "landscape",
  });
}
