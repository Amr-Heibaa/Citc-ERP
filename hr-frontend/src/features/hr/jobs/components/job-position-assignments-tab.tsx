import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useEmployeeNameLookup,
  useJobPositionAssignments,
} from "@/features/hr/jobs/api/use-job-positions";
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
  const { t } = useTranslation();
  const [assignOpen, setAssignOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const history = useJobPositionAssignments(position.positionId ?? 0);
  const assignment = position.currentAssignment;
  const employeeNames = useEmployeeNameLookup();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle>{t("jobs.positionDetail.assignments.currentAssignment")}</SectionTitle>

          {assignment ? (
            <div className="flex flex-col gap-2">
              <InfoRow label={t("jobs.positionDetail.assignments.employee")} value={assignment.employeeName} />
              <InfoRow
                label={t("jobs.positionDetail.assignments.assignmentType")}
                value={assignment.assignmentType}
              />
              <InfoRow
                label={t("jobs.positionDetail.assignments.status")}
                value={<JobStatusBadge active={assignment.active ?? false} />}
              />
              <InfoRow
                label={t("jobs.positionDetail.assignments.startDate")}
                value={formatDate(assignment.startDate)}
              />
              <InfoRow
                label={t("jobs.positionDetail.assignments.endDate")}
                value={formatDate(assignment.endDate)}
              />
              <InfoRow
                label={t("jobs.positionDetail.assignments.assignedBy")}
                value={
                  assignment.assignedBy != null
                    ? employeeNames[assignment.assignedBy]
                    : undefined
                }
              />
              <InfoRow
                label={t("jobs.positionDetail.assignments.assignedAt")}
                value={formatDate(assignment.assignedAt?.slice(0, 10))}
              />
            </div>
          ) : (
            <p className="font-['Inter',sans-serif] text-sm text-gray-400">
              {t("jobs.positionDetail.assignments.noCurrentAssignment")}
            </p>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle>{t("jobs.positionDetail.assignments.changeAssignment")}</SectionTitle>
          </div>

          <p className="font-['Inter',sans-serif] text-sm text-gray-500">
            {t("jobs.positionDetail.assignments.reassignHint")}
          </p>

          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => setAssignOpen(true)}>
              <UserPlus className="size-3.5" />
              {assignment
                ? t("jobs.positionDetail.assignments.changeEmployee")
                : t("jobs.positionDetail.assignments.assignEmployee")}
            </Button>

            {assignment && (
              <Button size="sm" variant="destructive" onClick={() => setEndOpen(true)}>
                <UserMinus className="size-3.5" />
                {t("jobs.positionDetail.assignments.endAssignment")}
              </Button>
            )}
          </div>
        </section>
      </div>

      <section>
        <SectionTitle>{t("jobs.positionDetail.assignments.assignmentHistory")}</SectionTitle>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          {history.isLoading ? (
            <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("jobs.positionDetail.assignments.loading")}
            </div>
          ) : !history.data || history.data.content?.length === 0 ? (
            <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              {t("jobs.positionDetail.assignments.noHistory")}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#f4f6f9]">
                <TableRow>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.employee")}</TableHead>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.type")}</TableHead>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.primary")}</TableHead>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.start")}</TableHead>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.end")}</TableHead>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.status")}</TableHead>
                  <TableHead>{t("jobs.positionDetail.assignments.tableHeaders.assignedBy")}</TableHead>
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
                      {row.primary ? t("common.yes") : t("common.no")}
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

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {row.assignedBy != null ? (employeeNames[row.assignedBy] ?? "—") : "—"}
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
