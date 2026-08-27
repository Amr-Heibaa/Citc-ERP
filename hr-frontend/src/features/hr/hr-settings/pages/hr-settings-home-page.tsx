import { useNavigate } from "react-router";

import { useHrSettingsSummary } from "@/features/hr/hr-settings/api/use-settings-summary";
import { HrSettingSummaryCard } from "@/features/hr/hr-settings/components/hr-setting-summary-card";

export function HrSettingsHomePage() {
  const navigate = useNavigate();
  const summary = useHrSettingsSummary();
  const data = summary.data;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            HR Settings
          </h1>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            Manage system configuration and master data
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/hr/settings/history")}
          className="font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] hover:underline"
        >
          View History →
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <HrSettingSummaryCard
          title="Employee Statuses"
          total={data?.employeeStatusCount ?? 0}
          active={data?.activeEmployeeStatusCount ?? 0}
          loading={summary.isLoading}
          actionLabel="View"
          onAction={() => navigate("/hr/settings/employee-statuses")}
        />

        <HrSettingSummaryCard
          title="Contract Types"
          total={data?.contractTypeCount ?? 0}
          active={data?.activeContractTypeCount ?? 0}
          loading={summary.isLoading}
          actionLabel="View"
          onAction={() => navigate("/hr/settings/contract-types")}
        />

        <HrSettingSummaryCard
          title="Skills"
          total={data?.skillCount ?? 0}
          active={data?.activeSkillCount ?? 0}
          loading={summary.isLoading}
          actionLabel="View"
          onAction={() => navigate("/hr/settings/skills")}
        />

        <HrSettingSummaryCard
          title="Functional Relation Types"
          total={data?.functionalRelationTypeCount ?? 0}
          active={data?.activeFunctionalRelationTypeCount ?? 0}
          loading={summary.isLoading}
          actionLabel="View"
          onAction={() => navigate("/hr/settings/functional-relation-types")}
        />
      </div>
    </div>
  );
}
