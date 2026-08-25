import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useJobPositionAssignments } from "@/features/hr/jobs/api/use-job-positions";
import { AssignEmployeeDialog } from "@/features/hr/jobs/components/assign-employee-dialog";
import { EndAssignmentDialog } from "@/features/hr/jobs/components/end-assignment-dialog";
import { JobStatusBadge } from "@/features/hr/jobs/components/job-status-badge";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function JobPositionAssignmentsTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const history = useJobPositionAssignments(position.positionId ?? 0);
  const assignment = position.currentAssignment;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle>Current Assignment</SectionTitle>

          {assignment ? (
            <div className="flex flex-col gap-2">
              <InfoRow label="Employee" value={assignment.employeeName} />
              <InfoRow label="Assignment Type" value={assignment.assignmentType} />
              <InfoRow label="Start Date" value={formatDate(assignment.startDate)} />
              <InfoRow label="End Date" value={formatDate(assignment.endDate)} />
            </div>
          ) : (
            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              This position has no current assignment.
            </p>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle>Change Assignment</SectionTitle>
          </div>

          <p className="font-['Inter',sans-serif] text-sm text-gray-500">
            Reassign this position to a different employee or end the current
            assignment. All changes are logged in the history below.
          </p>

          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => setAssignOpen(true)}>
              <UserPlus className="size-3.5" />
              {assignment ? "Change Employee" : "Assign Employee"}
            </Button>

            {assignment && (
              <Button size="sm" variant="destructive" onClick={() => setEndOpen(true)}>
                <UserMinus className="size-3.5" />
                End Assignment
              </Button>
            )}
          </div>
        </section>
      </div>

      <section>
        <SectionTitle>Assignment History</SectionTitle>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          {history.isLoading ? (
            <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              Loading…
            </div>
          ) : !history.data || history.data.content?.length === 0 ? (
            <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              No assignment history yet.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#f4f6f9]">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {history.data.content?.map((row) => (
                  <TableRow key={row.assignmentId}>
                    <TableCell>
                      <p className="font-['Inter',sans-serif] text-sm font-medium text-[#1a2535]">
                        {row.employeeName}
                      </p>

                      <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                        {row.employeeNumber}
                      </p>
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.assignmentType}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.primary ? "Yes" : "No"}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(row.startDate)}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(row.endDate)}
                    </TableCell>

                    <TableCell>
                      <JobStatusBadge active={row.active ?? false} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <AssignEmployeeDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
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
