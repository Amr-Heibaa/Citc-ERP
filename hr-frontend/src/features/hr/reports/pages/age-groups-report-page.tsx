import { AlertTriangle, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useMemo, useState } from "react";
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
import { ageFromBirthDate, formatDate } from "@/features/hr/shared/utils/format";
import { useAllEmployeeDetailsForReport } from "@/features/hr/reports/api/use-reports";
import {
  downloadAgeGroupsCsv,
  downloadAgeGroupsExcel,
  printAgeGroupsReport,
  RETIREMENT_AGE,
} from "@/features/hr/reports/utils/age-groups-report-export";
import type { EmployeeDetail } from "@/lib/api/generated/model";

const AGE_BRACKETS = [
  { key: "under30", min: 0, max: 29 },
  { key: "30to39", min: 30, max: 39 },
  { key: "40to49", min: 40, max: 49 },
  { key: "50to59", min: 50, max: 59 },
  { key: "60plus", min: 60, max: Infinity },
] as const;

function isCurrentEmployee(employee: EmployeeDetail) {
  return !employee.terminationDate && employee.statusCode !== "TERMINATED";
}

export function AgeGroupsReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const query = useAllEmployeeDetailsForReport();

  const employeesWithAge = useMemo(() => {
    return (query.data ?? [])
      .filter(isCurrentEmployee)
      .map((employee) => ({ ...employee, age: ageFromBirthDate(employee.birthDate) }));
  }, [query.data]);

  const knownAge = useMemo(
    () => employeesWithAge.filter((e) => e.age != null),
    [employeesWithAge],
  );

  const retirementAge = useMemo(
    () => knownAge.filter((e) => (e.age as number) >= RETIREMENT_AGE),
    [knownAge],
  );

  const brackets = useMemo(
    () =>
      AGE_BRACKETS.map((bracket) => ({
        ...bracket,
        employees: knownAge.filter(
          (e) => (e.age as number) >= bracket.min && (e.age as number) <= bracket.max,
        ),
      })),
    [knownAge],
  );

  const maxCount = Math.max(1, ...brackets.map((b) => b.employees.length));

  async function handleExcel() {
    setExporting(true);
    try {
      await downloadAgeGroupsExcel(knownAge);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {t("reports.ageGroupsReport.title")}
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            {t("reports.ageGroupsReport.summary", { count: knownAge.length })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadAgeGroupsCsv(knownAge)}
            disabled={knownAge.length === 0}
          >
            <Download className="size-4" />
            {t("reports.ageGroupsReport.csv")}
          </Button>

          <Button variant="outline" onClick={handleExcel} disabled={knownAge.length === 0 || exporting}>
            <FileSpreadsheet className="size-4" />
            {t("reports.ageGroupsReport.excel")}
          </Button>

          <Button
            onClick={() => printAgeGroupsReport(knownAge)}
            disabled={knownAge.length === 0}
            className="bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            <FileText className="size-4" />
            {t("reports.ageGroupsReport.pdf")}
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-100 bg-white font-['Inter',sans-serif] text-sm text-gray-400">
          {t("reports.ageGroupsReport.loading")}
        </div>
      ) : query.isError ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-gray-100 bg-white font-['Inter',sans-serif] text-sm text-red-600">
          {t("reports.ageGroupsReport.unableToLoad")}
        </div>
      ) : (
        <>
          {retirementAge.length > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-600" />
                <h2 className="font-['Inter',sans-serif] text-base font-bold text-red-700">
                  {t("reports.ageGroupsReport.retirementAlert.title", {
                    count: retirementAge.length,
                    age: RETIREMENT_AGE,
                  })}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {retirementAge.map((employee) => (
                  <button
                    key={employee.employeeId}
                    type="button"
                    onClick={() =>
                      employee.employeeId != null &&
                      navigate(`/hr/employees/${employee.employeeId}`)
                    }
                    className="rounded-full border border-red-200 bg-white px-3 py-1.5 font-['Inter',sans-serif] text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    {employee.displayName} · {employee.age}{" "}
                    {t("reports.ageGroupsReport.retirementAlert.yearsOld")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {brackets.map((bracket) => (
              <div
                key={bracket.key}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4"
              >
                <p className="font-['Inter',sans-serif] text-xs font-medium text-gray-400">
                  {t(`reports.ageGroupsReport.brackets.${bracket.key}`)}
                </p>

                <p className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
                  {bracket.employees.length}
                </p>

                <div className="h-2 w-full rounded-full bg-[#f4f6f9]">
                  <div
                    className={`h-2 rounded-full ${
                      bracket.key === "60plus" ? "bg-red-500" : "bg-[#f5841f]"
                    }`}
                    style={{
                      width: `${(bracket.employees.length / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            {knownAge.length === 0 ? (
              <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
                {t("reports.ageGroupsReport.noResults")}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#f4f6f9]">
                  <TableRow>
                    <TableHead>{t("reports.ageGroupsReport.columns.employeeNumber")}</TableHead>
                    <TableHead>{t("reports.ageGroupsReport.columns.name")}</TableHead>
                    <TableHead>{t("reports.ageGroupsReport.columns.department")}</TableHead>
                    <TableHead>{t("reports.ageGroupsReport.columns.birthDate")}</TableHead>
                    <TableHead>{t("reports.ageGroupsReport.columns.age")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {[...knownAge]
                    .sort((a, b) => (b.age ?? 0) - (a.age ?? 0))
                    .map((employee) => (
                      <TableRow
                        key={employee.employeeId}
                        className={
                          (employee.age as number) >= RETIREMENT_AGE ? "bg-red-50" : undefined
                        }
                      >
                        <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                          {employee.employeeNumber}
                        </TableCell>
                        <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                          {employee.displayName}
                        </TableCell>
                        <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                          {employee.department ?? "—"}
                        </TableCell>
                        <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                          {formatDate(employee.birthDate)}
                        </TableCell>
                        <TableCell className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                          {employee.age}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
