import { ArrowLeftRight, Power, PowerOff, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AssignmentChangeDialog } from "@/features/hr/employees/components/assignment-change-dialog";
import { ChangeStatusDialog } from "@/features/hr/employees/components/change-status-dialog";
import { ReactivateEmploymentDialog } from "@/features/hr/employees/components/reactivate-employment-dialog";
import { TerminateEmploymentDialog } from "@/features/hr/employees/components/terminate-employment-dialog";
import {
  useEmploymentHistory,
  useEmploymentOverview,
  useEmploymentTimeline,
} from "@/features/hr/employees/api/use-employment";
import { TERMINAL_STATUS_CODES } from "@/features/hr/employees/schemas/employment-schema";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Power;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-2 py-2 font-['Inter',sans-serif] text-sm font-medium transition-colors ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-[#f5841f] hover:bg-[#f5841f]/10"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export function EmploymentTab({ emp }: { emp: EmployeeDetail }) {
  const { t } = useTranslation();
  const employeeId = emp.employeeId ?? 0;

  const [statusOpen, setStatusOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);

  const overview = useEmploymentOverview(employeeId);
  const history = useEmploymentHistory(employeeId);
  const timeline = useEmploymentTimeline(employeeId);

  if (overview.isLoading || !overview.data) {
    return (
      <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
        {t("employees.employmentTab.loadingOverview")}
      </div>
    );
  }

  const data = overview.data;
  const isTerminal = TERMINAL_STATUS_CODES.includes(data.statusCode ?? "");

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div>
            <SectionTitle>{t("employees.sections.currentEmployment")}</SectionTitle>

            <div className="flex flex-col gap-2">
              <InfoRow label={t("employees.fields.status")} value={data.statusName} accent={!isTerminal} />
              <InfoRow label={t("employees.fields.hireDate")} value={formatDate(data.hireDate)} />
              <InfoRow label={t("employees.fields.startDate")} value={formatDate(data.startDate)} />
              <InfoRow
                label={t("employees.fields.terminationDate")}
                value={formatDate(data.terminationDate)}
              />
            </div>
          </div>

          <div>
            <SectionTitle>{t("employees.sections.positionAndOrganization")}</SectionTitle>

            <div className="flex flex-col gap-2">
              <InfoRow label={t("employees.fields.organization")} value={data.organizationNameEn} />
              <InfoRow label={t("employees.fields.organizationUnit")} value={data.orgUnitName} />
              <InfoRow label={t("employees.fields.position")} value={data.positionTitle} />
              <InfoRow label={t("employees.fields.grade")} value={data.gradeName} />
              <InfoRow label={t("employees.fields.assignmentType")} value={data.assignmentTypeName} />
              <InfoRow
                label={t("employees.fields.assignmentStart")}
                value={formatDate(data.assignmentStartDate)}
              />
            </div>
          </div>

          <div>
            <SectionTitle>{t("employees.sections.management")}</SectionTitle>

            <div className="flex flex-col gap-2">
              <InfoRow label={t("employees.fields.teamLeader")} value={data.teamLeaderName} />
              <InfoRow label={t("employees.fields.manager")} value={data.managerName} />
              <InfoRow label={t("employees.fields.reportsToPosition")} value={data.reportsToPositionTitle} />
              <InfoRow label={t("employees.fields.reportsToEmployee")} value={data.reportsToEmployeeName} />
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>{t("employees.sections.quickActions")}</SectionTitle>

          <div className="flex flex-col gap-1">
            {isTerminal ? (
              <QuickActionButton
                icon={RotateCcw}
                label={t("employees.actions.reactivateEmployment")}
                onClick={() => setReactivateOpen(true)}
              />
            ) : (
              <>
                <QuickActionButton
                  icon={Power}
                  label={t("employees.actions.changeStatus")}
                  onClick={() => setStatusOpen(true)}
                />

                <QuickActionButton
                  icon={ArrowLeftRight}
                  label={t("employees.actions.transferPromoteDemote")}
                  onClick={() => setAssignmentOpen(true)}
                />

                <QuickActionButton
                  icon={PowerOff}
                  label={t("employees.actions.terminateEmployment")}
                  destructive
                  onClick={() => setTerminateOpen(true)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.employmentHistory")}</SectionTitle>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          {history.isLoading ? (
            <div className="flex h-24 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("employees.employmentTab.loading")}
            </div>
          ) : !history.data || history.data.content?.length === 0 ? (
            <div className="flex h-24 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("employees.employmentTab.noEmploymentPeriods")}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#f4f6f9]">
                <tr>
                  {[
                    t("employees.fields.type"),
                    t("employees.fields.unit"),
                    t("employees.fields.position"),
                    t("employees.fields.reportsTo"),
                    t("employees.fields.start"),
                    t("employees.fields.end"),
                    t("employees.fields.current"),
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-4 py-2 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {history.data.content?.map((row) => (
                  <tr key={row.employmentId} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-[#1a2535]">
                      {row.recordTypeName}
                    </td>

                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.orgUnitName}
                    </td>

                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.positionTitle}
                    </td>

                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.reportingToEmployeeName}
                    </td>

                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(row.startDate)}
                    </td>

                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(row.endDate)}
                    </td>

                    <td className="px-4 py-2 font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.current ? t("employees.fields.yes") : t("employees.fields.no")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.employmentTimeline")}</SectionTitle>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          {timeline.isLoading ? (
            <div className="flex h-24 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("employees.employmentTab.loading")}
            </div>
          ) : !timeline.data || timeline.data.items?.length === 0 ? (
            <div className="flex h-24 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("employees.employmentTab.noTraceableEvents")}
            </div>
          ) : (
            <ol className="relative ml-2 border-l border-gray-200 p-4">
              {timeline.data.items?.map((event) => (
                <li key={event.eventId} className="relative mb-5 ml-5 last:mb-0">
                  <span className="absolute -left-[27px] mt-1 size-2.5 rounded-full bg-[#f5841f]" />

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                      {event.eventType}
                    </p>

                    <span className="font-['Inter',sans-serif] text-xs text-gray-400">
                      {formatDate(event.createdAt?.slice(0, 10))}
                    </span>
                  </div>

                  <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-500">
                    {event.description}
                  </p>

                  <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                    {t("employees.employmentTab.by", { name: event.performedByName ?? t("common.system") })}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <ChangeStatusDialog open={statusOpen} onOpenChange={setStatusOpen} overview={data} />

      <TerminateEmploymentDialog
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        overview={data}
      />

      <ReactivateEmploymentDialog
        open={reactivateOpen}
        onOpenChange={setReactivateOpen}
        overview={data}
      />

      <AssignmentChangeDialog
        open={assignmentOpen}
        onOpenChange={setAssignmentOpen}
        overview={data}
      />
    </div>
  );
}
