import type { EmployeeDetail } from "@/lib/api/generated/model";

import i18n from "@/i18n";
import { formatDate } from "@/features/hr/shared/utils/format";
import {
  downloadCsv,
  downloadExcel,
  printTableReport,
} from "@/features/hr/shared/utils/export";

function exportRows(employees: (EmployeeDetail & { age: number | null })[]) {
  return employees.map((employee) => ({
    [i18n.t("reports.ageGroupsReport.columns.employeeNumber")]: employee.employeeNumber ?? "",
    [i18n.t("reports.ageGroupsReport.columns.name")]: employee.displayName ?? "",
    [i18n.t("reports.ageGroupsReport.columns.department")]: employee.department ?? "",
    [i18n.t("reports.ageGroupsReport.columns.position")]: employee.positionTitle ?? "",
    [i18n.t("reports.ageGroupsReport.columns.birthDate")]: formatDate(employee.birthDate),
    [i18n.t("reports.ageGroupsReport.columns.age")]: employee.age ?? "",
  }));
}

export function downloadAgeGroupsCsv(employees: (EmployeeDetail & { age: number | null })[]) {
  downloadCsv("age-groups-report", exportRows(employees));
}

export async function downloadAgeGroupsExcel(
  employees: (EmployeeDetail & { age: number | null })[],
) {
  await downloadExcel("age-groups-report", exportRows(employees), "Age Groups");
}

export function printAgeGroupsReport(
  employees: (EmployeeDetail & { age: number | null })[],
) {
  printTableReport({
    title: i18n.t("reports.ageGroupsReport.title"),
    subtitle: i18n.t("reports.ageGroupsReport.summary", { count: employees.length }),
    rows: exportRows(employees),
  });
}
