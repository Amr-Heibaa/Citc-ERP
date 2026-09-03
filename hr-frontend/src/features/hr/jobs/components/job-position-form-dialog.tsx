import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobGrades } from "@/features/hr/jobs/api/use-job-grades";
import {
  useJobPositionsForOrganization,
  useOrganizationsForJobs,
  useOrgUnitsForJobs,
} from "@/features/hr/jobs/api/use-job-positions";
import {
  jobPositionSchema,
  type JobPositionFormValues,
} from "@/features/hr/jobs/schemas/job-position-schema";
import { BooleanSelectField } from "@/features/hr/shared/components/boolean-select-field";
import { LabeledField } from "@/features/hr/shared/components/labeled-field";
import { SelectField } from "@/features/hr/shared/components/select-field";
import { StatusSelectField } from "@/features/hr/shared/components/status-select-field";

export function JobPositionForm({
  defaultValues,
  excludePositionId,
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  defaultValues: JobPositionFormValues;
  excludePositionId?: number;
  submitLabel: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (values: JobPositionFormValues) => void;
}) {
  const { t } = useTranslation();
  const organizations = useOrganizationsForJobs();
  const grades = useJobGrades(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<JobPositionFormValues>({
    resolver: zodResolver(jobPositionSchema),
    defaultValues,
  });

  const organizationId = useWatch({ control, name: "organizationId" });
  const open = useWatch({ control, name: "open" });
  const active = useWatch({ control, name: "active" });

  const orgUnits = useOrgUnitsForJobs(
    organizationId ? Number(organizationId) : undefined,
  );

  const candidateReportsTo = useJobPositionsForOrganization(
    organizationId ? Number(organizationId) : undefined,
  );

  useEffect(() => {
    if (organizationId !== defaultValues.organizationId) {
      setValue("orgUnitId", "");
      setValue("reportsToPositionId", "");
    }
    // Only reset when the organization actually changes from what the user
    // picked, not on initial mount with the default value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const submit = handleSubmit((values) => onSubmit(values));

  const reportsToOptions =
    candidateReportsTo.data?.content?.flatMap((candidate) => {
      if (candidate.positionId == null || candidate.positionId === excludePositionId) {
        return [];
      }

      return [
        {
          value: String(candidate.positionId),
          label: candidate.titleEn ?? candidate.code,
        },
      ];
    }) ?? [];

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label={t("jobs.positionForm.titleEn")} error={errors.titleEn?.message}>
            <Input {...register("titleEn")} placeholder={t("jobs.positionForm.titleEnPlaceholder")} />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.titleAr")} error={errors.titleAr?.message}>
            <Input
              {...register("titleAr")}
              dir="rtl"
              placeholder={t("jobs.positionForm.titleArPlaceholder")}
            />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.organization")} error={errors.organizationId?.message}>
            <SelectField
              control={control}
              name="organizationId"
              placeholder={t("jobs.positionForm.selectOrganization")}
              options={
                organizations.data?.map((org) => ({
                  value: String(org.id),
                  label: org.nameEn,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.organizationUnit")} error={errors.orgUnitId?.message}>
            <SelectField
              control={control}
              name="orgUnitId"
              placeholder={t("jobs.positionForm.selectUnit")}
              disabled={!organizationId}
              options={
                orgUnits.data?.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.jobGrade")} error={errors.gradeId?.message}>
            <SelectField
              control={control}
              name="gradeId"
              placeholder={t("jobs.positionForm.selectGrade")}
              options={
                grades.data?.map((grade) => ({
                  value: String(grade.gradeId),
                  label: `${grade.code} - ${grade.nameEn}`,
                })) ?? []
              }
            />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.positionLevel")} error={errors.positionLevel?.message}>
            <Input
              type="number"
              min={1}
              {...register("positionLevel", { valueAsNumber: true })}
            />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.reportsTo")} error={errors.reportsToPositionId?.message}>
            <SelectField
              control={control}
              name="reportsToPositionId"
              placeholder={t("jobs.positionForm.selectReportingPosition")}
              disabled={!organizationId}
              options={reportsToOptions}
            />
          </LabeledField>

          <LabeledField label={t("jobs.positionForm.status")}>
            <StatusSelectField
              active={active}
              onChange={(checked) => setValue("active", checked)}
            />
          </LabeledField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label={t("jobs.positionForm.openForHiring")}>
            <BooleanSelectField
              value={open}
              onChange={(checked) => setValue("open", checked)}
              trueLabel={t("jobs.positionForm.open")}
              falseLabel={t("jobs.positionForm.closed")}
            />
          </LabeledField>
        </div>

        <LabeledField label={t("jobs.positionForm.descriptionEn")} error={errors.descriptionEn?.message}>
          <Textarea {...register("descriptionEn")} rows={4} />
        </LabeledField>

        <LabeledField label={t("jobs.positionForm.descriptionAr")} error={errors.descriptionAr?.message}>
          <Textarea {...register("descriptionAr")} rows={4} dir="rtl" />
        </LabeledField>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>

        <Button type="submit" disabled={pending}>
          {pending ? t("jobs.positionForm.saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
