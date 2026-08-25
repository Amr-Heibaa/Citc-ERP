import { Mail, Phone, UserCog, UserMinus } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAssignedEmployeeDetail } from "@/features/hr/jobs/api/use-job-positions";
import { AssignEmployeeDialog } from "@/features/hr/jobs/components/assign-employee-dialog";
import { EndAssignmentDialog } from "@/features/hr/jobs/components/end-assignment-dialog";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate, initials } from "@/features/hr/shared/utils/format";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function JobPositionEmployeeTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const [changeOpen, setChangeOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const assignment = position.currentAssignment;
  const employeeDetail = useAssignedEmployeeDetail(assignment?.employeeId);

  if (!assignment) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
        <p className="font-['Inter',sans-serif] text-sm font-medium text-[#1a2535]">
          No employee assigned
        </p>

        <p className="font-['Inter',sans-serif] text-xs text-gray-400">
          This position is currently open.
        </p>

        <button
          type="button"
          onClick={() => setChangeOpen(true)}
          className="mt-3 font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] hover:underline"
        >
          Assign an employee
        </button>

        <AssignEmployeeDialog
          open={changeOpen}
          onOpenChange={setChangeOpen}
          position={position}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>Current Employee</SectionTitle>

        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback>{initials(assignment.employeeName)}</AvatarFallback>
          </Avatar>

          <div>
            <p className="font-['Inter',sans-serif] text-lg font-semibold text-[#1a2535]">
              {assignment.employeeName}
            </p>

            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              {assignment.employeeNumber}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 font-['Inter',sans-serif] text-sm text-gray-500">
          <p className="flex items-center gap-2">
            <Mail className="size-4" />
            {employeeDetail.data?.businessEmail ??
              employeeDetail.data?.personalEmail ??
              "—"}
          </p>

          <p className="flex items-center gap-2">
            <Phone className="size-4" />
            {employeeDetail.data?.mobileNumber ?? "—"}
          </p>
        </div>
      </section>

      <div className="space-y-6">
        <section>
          <SectionTitle>Employment Information</SectionTitle>

          <div className="flex flex-col gap-2">
            <InfoRow label="Assignment Type" value={assignment.assignmentType} />
            <InfoRow label="Primary" value={assignment.primary ? "Yes" : "No"} />
            <InfoRow label="Start Date" value={formatDate(assignment.startDate)} />
            <InfoRow label="End Date" value={formatDate(assignment.endDate)} />
          </div>
        </section>

        <section>
          <SectionTitle>Assignment Summary</SectionTitle>

          <div className="flex flex-col gap-2">
            <InfoRow
              label="Assigned At"
              value={formatDate(assignment.assignedAt?.slice(0, 10))}
            />
          </div>
        </section>

        <section>
          <SectionTitle>Quick Actions</SectionTitle>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setChangeOpen(true)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 font-['Inter',sans-serif] text-sm font-medium text-[#f5841f] transition-colors hover:bg-[#f5841f]/10"
            >
              <UserCog className="size-4" />
              Change Employee
            </button>

            <button
              type="button"
              onClick={() => setEndOpen(true)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 font-['Inter',sans-serif] text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <UserMinus className="size-4" />
              End Assignment
            </button>
          </div>
        </section>
      </div>

      <AssignEmployeeDialog
        open={changeOpen}
        onOpenChange={setChangeOpen}
        position={position}
      />

      <EndAssignmentDialog
        open={endOpen}
        onOpenChange={setEndOpen}
        position={position}
      />
    </div>
  );
}
