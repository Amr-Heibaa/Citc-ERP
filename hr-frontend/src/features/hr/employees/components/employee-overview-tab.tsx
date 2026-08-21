import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function OverviewTab({ emp }: { emp: EmployeeDetail }) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>Employee Information</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Employee ID" value={emp.employeeNumber} />
          <InfoRow label="Hire Date" value={formatDate(emp.hireDate)} />
          <InfoRow label="Status" value={emp.statusName} accent />
          <InfoRow label="Start Date" value={formatDate(emp.startDate)} />
        </div>
      </div>

      <div>
        <SectionTitle>Organization</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Branch" value={emp.branch} />
          <InfoRow label="Section" value={emp.section} />
          <InfoRow label="Department" value={emp.department} />
          <div />
        </div>
      </div>

      <div>
        <SectionTitle>Position</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label="Position" value={emp.positionTitle} />
          <InfoRow label="Grade" value={emp.gradeName} />
          <InfoRow label="Manager" value={emp.manager} />
        </div>
      </div>

      <div>
        <SectionTitle>Skills</SectionTitle>

        {(emp.skills ?? []).length === 0 ? (
          <p className="text-[13px] text-gray-400">No skills recorded.</p>
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
