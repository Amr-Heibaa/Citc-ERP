import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useJobGrades } from "@/features/hr/jobs/api/use-job-grades";
import { JobGradeFormDialog } from "@/features/hr/jobs/components/job-grade-form-dialog";
import { JobStatusBadge } from "@/features/hr/jobs/components/job-status-badge";
import type { JobGradeResponse } from "@/lib/api/generated/model";

export function JobGradesPage() {
  const navigate = useNavigate();
  const grades = useJobGrades();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<JobGradeResponse>();

  function openCreate() {
    setEditingGrade(undefined);
    setFormOpen(true);
  }

  function openEdit(grade: JobGradeResponse) {
    setEditingGrade(grade);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/hr/jobs")}
            className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back to Jobs
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            Job Grades
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            Manage the salary/job grade structure used by positions.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Grade
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {grades.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            Loading grades…
          </div>
        ) : grades.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            Unable to load job grades.
          </div>
        ) : !grades.data || grades.data.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            No grades yet.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>Grade Code</TableHead>
                <TableHead>Grade Name (EN)</TableHead>
                <TableHead>Grade Name (AR)</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Positions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {grades.data.map((grade) => (
                <TableRow key={grade.gradeId}>
                  <TableCell className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    {grade.code}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {grade.nameEn}
                  </TableCell>

                  <TableCell dir="rtl" className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {grade.nameAr}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {grade.rank}
                  </TableCell>

                  <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                    {grade.positionsCount ?? 0}
                  </TableCell>

                  <TableCell>
                    <JobStatusBadge active={grade.active ?? false} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit grade"
                      onClick={() => openEdit(grade)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <JobGradeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        grade={editingGrade}
      />
    </div>
  );
}
