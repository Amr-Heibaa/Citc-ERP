import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useEmploymentDirectory } from "@/features/hr/employment/api/use-employment-directory";
import { usePositionAssignmentStatistics } from "@/features/hr/employment/api/use-position-statistics";
import { EmploymentSummaryCard } from "@/features/hr/employment/components/employment-summary-card";
import type { EmployeeSummary } from "@/lib/api/generated/model";

const NO_EMPLOYEES: EmployeeSummary[] = [];

export function EmploymentHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const directoryQuery = useEmploymentDirectory();
  const statistics = usePositionAssignmentStatistics();

  const employees = directoryQuery.data ?? NO_EMPLOYEES;

  const recordStats = useMemo(() => {
    const now = new Date();
    let active = 0;
    let hiredThisYear = 0;
    let hiredThisMonth = 0;

    for (const employee of employees) {
      if (employee.statusCode === "ACTIVE") {
        active += 1;
      }

      if (employee.hireDate) {
        const hireDate = new Date(employee.hireDate);

        if (hireDate.getFullYear() === now.getFullYear()) {
          hiredThisYear += 1;

          if (hireDate.getMonth() === now.getMonth()) {
            hiredThisMonth += 1;
          }
        }
      }
    }

    return { active, hiredThisYear, hiredThisMonth };
  }, [employees]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
          {t("employment.home.title")}
        </h1>

        <p className="font-['Inter',sans-serif] text-sm text-gray-400">
          {t("employment.home.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EmploymentSummaryCard
          title={t("employment.home.recordsCard.title")}
          headline={employees.length}
          headlineLabel={t("employment.home.recordsCard.headlineLabel")}
          loading={directoryQuery.isLoading}
          stats={[
            { value: recordStats.active, label: t("employment.home.recordsCard.active") },
            { value: recordStats.hiredThisYear, label: t("employment.home.recordsCard.thisYear") },
            { value: recordStats.hiredThisMonth, label: t("employment.home.recordsCard.thisMonth") },
          ]}
          actionLabel={t("employment.home.recordsCard.actionLabel")}
          onAction={() => navigate("/hr/employment/records")}
        />

        <EmploymentSummaryCard
          title={t("employment.home.positionsCard.title")}
          headline={statistics.data?.totalPositions ?? 0}
          headlineLabel={t("employment.home.positionsCard.headlineLabel")}
          loading={statistics.isLoading}
          stats={[
            { value: statistics.data?.occupiedPositions ?? 0, label: t("employment.home.positionsCard.occupied") },
            { value: statistics.data?.openPositions ?? 0, label: t("employment.home.positionsCard.open") },
            { value: statistics.data?.inactivePositions ?? 0, label: t("employment.home.positionsCard.inactive") },
          ]}
          actionLabel={t("employment.home.positionsCard.actionLabel")}
          onAction={() => navigate("/hr/jobs/positions")}
        />
      </div>
    </div>
  );
}
