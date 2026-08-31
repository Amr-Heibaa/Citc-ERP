import { useTranslation } from "react-i18next";

import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function OverviewTab({ emp }: { emp: EmployeeDetail }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>{t("employees.sections.employeeInformation")}</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label={t("employees.fields.employeeId")} value={emp.employeeNumber} />
          <InfoRow label={t("employees.fields.hireDate")} value={formatDate(emp.hireDate)} />
          <InfoRow label={t("employees.fields.status")} value={emp.statusName} accent />
          <InfoRow label={t("employees.fields.startDate")} value={formatDate(emp.startDate)} />
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.organization")}</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label={t("employees.fields.branch")} value={emp.branch} />
          <InfoRow label={t("employees.fields.sectionField")} value={emp.section} />
          <InfoRow label={t("employees.fields.department")} value={emp.department} />
          <div />
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.position")}</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label={t("employees.fields.position")} value={emp.positionTitle} />
          <InfoRow label={t("employees.fields.grade")} value={emp.gradeName} />
          <InfoRow label={t("employees.fields.manager")} value={emp.manager} />
        </div>
      </div>

      <div>
        <SectionTitle>{t("employees.sections.skills")}</SectionTitle>

        {(emp.skills ?? []).length === 0 ? (
          <p className="text-[13px] text-gray-400">{t("employees.fields.noSkillsRecorded")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(emp.skills ?? []).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-emerald-100 px-3 py-1 font-['Inter',sans-serif] text-xs font-medium text-emerald-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
