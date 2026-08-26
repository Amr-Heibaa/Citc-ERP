import { ArrowRight, Mail, MapPin, Phone, UserCog, UserMinus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssignedEmployeeDetail } from "@/features/hr/jobs/api/use-job-positions";
import { AssignEmployeeDialog } from "@/features/hr/jobs/components/assign-employee-dialog";
import { EndAssignmentDialog } from "@/features/hr/jobs/components/end-assignment-dialog";
import { formatDate, formatDuration, initials } from "@/features/hr/shared/utils/format";
import type { JobPositionDetail } from "@/lib/api/generated/model";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 p-5">
      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
        {title}
      </h3>

      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-50 py-2.5 last:border-0">
      <span className="font-['Inter',sans-serif] text-sm text-gray-500">
        {label}
      </span>

      <span className="font-['Inter',sans-serif] text-sm font-medium text-[#1a2535]">
        {value || "—"}
      </span>
    </div>
  );
}

export function JobPositionEmployeeTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const navigate = useNavigate();
  const [changeOpen, setChangeOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const assignment = position.currentAssignment;
  const employeeDetail = useAssignedEmployeeDetail(assignment?.employeeId);
  const assignedByDetail = useAssignedEmployeeDetail(assignment?.assignedBy);

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

  const emp = employeeDetail.data;
  const activeContract = emp?.contracts?.find((c) => c.active) ?? emp?.contracts?.[0];
  const employeeType =
    activeContract?.fulltime == null
      ? undefined
      : activeContract.fulltime
        ? "Full Time"
        : "Part Time";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Section title="Current Employee">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5841f]">
              {emp?.profilePhotoDataUrl ? (
                <img
                  src={emp.profilePhotoDataUrl}
                  alt={assignment.employeeName ?? ""}
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-['Inter',sans-serif] text-lg font-bold text-white">
                  {initials(assignment.employeeName)}
                </span>
              )}
            </div>

            <div>
              <p className="font-['Inter',sans-serif] text-lg font-semibold text-[#1a2535]">
                {assignment.employeeName}
              </p>

              <p className="font-['Inter',sans-serif] text-sm text-gray-400">
                {assignment.employeeNumber}
              </p>

              <p className="font-['Inter',sans-serif] text-sm text-gray-500">
                {position.titleEn}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge className="border-0 bg-emerald-100 text-emerald-700">
              {emp?.statusName ?? "—"}
            </Badge>

            {assignment.employeeId != null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/hr/employees/${assignment.employeeId}`)}
              >
                View Employee Profile
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </Section>

        <Section title="Employee Contact">
          <div className="space-y-3 font-['Inter',sans-serif] text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-gray-400" />
              {emp?.mobileNumber ?? "—"}
            </p>

            <p className="flex items-center gap-2">
              <Mail className="size-4 text-gray-400" />
              {emp?.businessEmail ?? emp?.personalEmail ?? "—"}
            </p>

            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-gray-400" />
              {emp?.workLocation ?? "—"}
            </p>
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Employment Information">
          <Row label="Employment Status" value={emp?.statusName} />
          <Row label="Employee Type" value={employeeType} />
          <Row label="Hire Date" value={formatDate(emp?.hireDate)} />
          <Row label="Service Duration" value={formatDuration(emp?.hireDate)} />
          <Row label="Current Assignment Since" value={formatDate(assignment.startDate)} />
        </Section>

        <Section title="Assignment Summary">
          <Row label="Assignment Type" value={assignment.assignmentType} />
          <Row label="Start Date" value={formatDate(assignment.startDate)} />
          <Row label="End Date" value={formatDate(assignment.endDate)} />
          <Row label="Assigned By" value={assignedByDetail.data?.displayName} />
          <Row label="Assigned At" value={formatDate(assignment.assignedAt?.slice(0, 10))} />
        </Section>

        <Section title="Quick Actions">
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
        </Section>
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
