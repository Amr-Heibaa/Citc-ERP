import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            {t("jobs.grades.backToJobs")}
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {t("jobs.grades.title")}
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            {t("jobs.grades.subtitle")}
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t("jobs.grades.addGrade")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {grades.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("jobs.grades.loading")}
          </div>
        ) : grades.isError ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
            {t("jobs.grades.unableToLoad")}
          </div>
        ) : !grades.data || grades.data.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            {t("jobs.grades.noGrades")}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#f4f6f9]">
              <TableRow>
                <TableHead>{t("jobs.grades.gradeCode")}</TableHead>
                <TableHead>{t("jobs.grades.gradeNameEn")}</TableHead>
                <TableHead>{t("jobs.grades.gradeNameAr")}</TableHead>
                <TableHead>{t("jobs.grades.rank")}</TableHead>
                <TableHead>{t("jobs.grades.positions")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("jobs.grades.actions")}</TableHead>
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
                      title={t("jobs.grades.editGrade")}
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
