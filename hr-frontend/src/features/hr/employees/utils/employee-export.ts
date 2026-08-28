import type { EmployeeSummary } from "@/lib/api/generated/model";

import { formatDate } from "@/features/hr/shared/utils/format";
import {
  downloadCsv as downloadCsvRows,
  downloadExcel as downloadExcelRows,
  printTableReport,
} from "@/features/hr/shared/utils/export";

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
  downloadCsvRows("employees", exportRows(employees));
}

export async function downloadExcel(employees: EmployeeSummary[]) {
  await downloadExcelRows("employees", exportRows(employees), "Employees");
}

export function printEmployees(employees: EmployeeSummary[]) {
  printTableReport({
    title: "Employees",
    subtitle: `${employees.length} employee records`,
    rows: exportRows(employees),
  });
}
