import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

export function EmploymentTab({ emp }: { emp: EmployeeDetail }) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <SectionTitle>Current Employment</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Department" value={emp.department} />
          <InfoRow label="Status" value={emp.statusName} accent />
          <InfoRow label="Hire Date" value={formatDate(emp.hireDate)} />
          <InfoRow label="Start Date" value={formatDate(emp.startDate)} />
        </div>
      </div>

      <div>
        <SectionTitle>Current Position</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Position" value={emp.positionTitle} />
          <InfoRow label="Grade" value={emp.gradeName} />
          <InfoRow label="Grade Rank" value={emp.gradeRank} />
          <InfoRow
            label="Termination Date"
            value={formatDate(emp.terminationDate)}
          />
        </div>
      </div>

      <div>
        <SectionTitle>Management</SectionTitle>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoRow label="Team Leader" value={emp.teamLeader} />
          <InfoRow label="Manager" value={emp.manager} />
          <div />
        </div>
      </div>
    </div>
  );
}
