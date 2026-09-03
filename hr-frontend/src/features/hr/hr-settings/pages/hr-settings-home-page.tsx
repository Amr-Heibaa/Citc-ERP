import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useContractTemplates } from "@/features/hr/hr-settings/api/use-contract-templates";
import { useJobGradesSummary } from "@/features/hr/hr-settings/api/use-job-grades-summary";
import { useHrSettingsSummary } from "@/features/hr/hr-settings/api/use-settings-summary";
import { HrSettingSummaryCard } from "@/features/hr/hr-settings/components/hr-setting-summary-card";
import { useGetMyAccess } from "@/lib/api/generated/ems/hr-access-controller/hr-access-controller";

export function HrSettingsHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const summary = useHrSettingsSummary();
  const data = summary.data;

  const grades = useJobGradesSummary();
  const gradeRows = grades.data ?? [];
  const activeGradesCount = gradeRows.filter((grade) => grade.active).length;

  const templates = useContractTemplates(true);
  const templateRows = templates.data ?? [];
  const activeTemplatesCount = templateRows.filter((template) => template.active).length;

  const myAccess = useGetMyAccess({ query: { retry: false } });
  const canManageDelegation = myAccess.data?.canManageDelegation ?? false;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {t("hrSettings.home.title")}
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            {t("hrSettings.home.subtitle")}
          </p>
        </div>

        <div className="flex gap-4">
          {canManageDelegation && (
            <button
              type="button"
              onClick={() => navigate("/hr/settings/access-delegation")}
              className="font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] hover:underline"
            >
              {t("hrSettings.home.accessDelegation")}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/hr/settings/history")}
            className="font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] hover:underline"
          >
            {t("hrSettings.home.viewHistory")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <HrSettingSummaryCard
          title={t("hrSettings.home.cards.employeeStatuses")}
          total={data?.employeeStatusCount ?? 0}
          active={data?.activeEmployeeStatusCount ?? 0}
          loading={summary.isLoading}
          actionLabel={t("hrSettings.home.cards.view")}
          onAction={() => navigate("/hr/settings/employee-statuses")}
        />

        <HrSettingSummaryCard
          title={t("hrSettings.home.cards.contractTypes")}
          total={data?.contractTypeCount ?? 0}
          active={data?.activeContractTypeCount ?? 0}
          loading={summary.isLoading}
          actionLabel={t("hrSettings.home.cards.view")}
          onAction={() => navigate("/hr/settings/contract-types")}
        />

        <HrSettingSummaryCard
          title={t("hrSettings.home.cards.skills")}
          total={data?.skillCount ?? 0}
          active={data?.activeSkillCount ?? 0}
          loading={summary.isLoading}
          actionLabel={t("hrSettings.home.cards.view")}
          onAction={() => navigate("/hr/settings/skills")}
        />

        <HrSettingSummaryCard
          title={t("hrSettings.home.cards.functionalRelationTypes")}
          total={data?.functionalRelationTypeCount ?? 0}
          active={data?.activeFunctionalRelationTypeCount ?? 0}
          loading={summary.isLoading}
          actionLabel={t("hrSettings.home.cards.view")}
          onAction={() => navigate("/hr/settings/functional-relation-types")}
        />

        <HrSettingSummaryCard
          title={t("hrSettings.home.cards.jobGrades")}
          total={gradeRows.length}
          active={activeGradesCount}
          loading={grades.isLoading}
          error={grades.isError}
          actionLabel={t("hrSettings.home.cards.view")}
          onAction={() => navigate("/hr/jobs/grades")}
        />

        <HrSettingSummaryCard
          title={t("hrSettings.home.cards.contractTemplates")}
          total={templateRows.length}
          active={activeTemplatesCount}
          loading={templates.isLoading}
          error={templates.isError}
          actionLabel={t("hrSettings.home.cards.view")}
          onAction={() => navigate("/hr/settings/contract-templates")}
        />
      </div>
    </div>
  );
}
