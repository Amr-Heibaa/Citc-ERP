import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCreateJobGrade,
  useUpdateJobGrade,
} from "@/features/hr/jobs/api/use-job-grades";
import {
  jobGradeSchema,
  type JobGradeFormValues,
} from "@/features/hr/jobs/schemas/job-grade-schema";
import {
  jobGradeToFormValues,
  toCreateJobGradeRequest,
  toUpdateJobGradeRequest,
} from "@/features/hr/jobs/schemas/job-grade-mappers";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";
import type { JobGradeResponse } from "@/lib/api/generated/model";

const EMPTY_DEFAULTS: JobGradeFormValues = {
  code: "",
  nameEn: "",
  nameAr: "",
  rank: 1,
  active: true,
};

export function JobGradeFormDialog({
  open,
  onOpenChange,
  grade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: JobGradeResponse;
}) {
  const { t } = useTranslation();
  const editMode = grade != null;
  const gradeId = grade?.gradeId ?? 0;

  const createGrade = useCreateJobGrade();
  const updateGrade = useUpdateJobGrade(gradeId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<JobGradeFormValues>({
    resolver: zodResolver(jobGradeSchema),
    defaultValues: grade ? jobGradeToFormValues(grade) : EMPTY_DEFAULTS,
  });

  const active = useWatch({ control, name: "active" });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(grade ? jobGradeToFormValues(grade) : EMPTY_DEFAULTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, grade]);

  const pending = createGrade.isPending || updateGrade.isPending;

  const submit = handleSubmit(async (values) => {
    try {
      if (editMode) {
        await updateGrade.mutateAsync(toUpdateJobGradeRequest(values));
        toast.success(t("jobs.grades.form.editSuccess"));
      } else {
        await createGrade.mutateAsync(toCreateJobGradeRequest(values));
        toast.success(t("jobs.grades.form.addSuccess"));
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("jobs.grades.form.saveError"),
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl text-[#1a2535]">
            {editMode ? t("jobs.grades.form.editTitle") : t("jobs.grades.form.addTitle")}
          </DialogTitle>

          <DialogDescription>
            {editMode
              ? t("jobs.grades.form.editDescription", { code: grade.code })
              : t("jobs.grades.form.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <LabeledField label={t("jobs.grades.form.gradeCode")} error={errors.code?.message}>
              <Input {...register("code")} placeholder={t("jobs.grades.form.codePlaceholder")} />
            </LabeledField>

            <LabeledField label={t("jobs.grades.form.rank")} error={errors.rank?.message}>
              <Input type="number" {...register("rank", { valueAsNumber: true })} />
            </LabeledField>

            <LabeledField label={t("jobs.grades.form.gradeNameEn")} error={errors.nameEn?.message}>
              <Input {...register("nameEn")} />
            </LabeledField>

            <LabeledField label={t("jobs.grades.form.gradeNameAr")} error={errors.nameAr?.message}>
              <Input {...register("nameAr")} dir="rtl" />
            </LabeledField>

            <LabeledField label={t("common.status")}>
              <StatusSelectField
                active={active}
                onChange={(checked) => setValue("active", checked)}
              />
            </LabeledField>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? t("jobs.grades.form.saving") : editMode ? t("jobs.grades.form.saveChanges") : t("jobs.grades.addGrade")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
