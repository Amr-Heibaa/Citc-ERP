import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateJobPosition } from "@/features/hr/jobs/api/use-job-positions";
import { JobPositionForm } from "@/features/hr/jobs/components/job-position-form-dialog";
import { toCreateJobPositionRequest } from "@/features/hr/jobs/schemas/job-position-mappers";
import type { JobPositionFormValues } from "@/features/hr/jobs/schemas/job-position-schema";

const EMPTY_DEFAULTS: JobPositionFormValues = {
  code: "",
  titleEn: "",
  titleAr: "",
  organizationId: "",
  orgUnitId: "",
  gradeId: "",
  positionLevel: 1,
  reportsToPositionId: "",
  descriptionEn: "",
  descriptionAr: "",
  open: true,
  active: true,
};

export function JobPositionCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createPosition = useCreateJobPosition();

  function close() {
    navigate("/hr/jobs/positions");
  }

  async function handleSubmit(values: JobPositionFormValues) {
    try {
      const created = await createPosition.mutateAsync(
        toCreateJobPositionRequest(values),
      );

      toast.success(t("jobs.positionForm.createSuccess"));
      navigate(`/hr/jobs/positions/${created.positionId}`);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : t("jobs.positionForm.createError");

      toast.error(message);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(900px, 95vw)",
          maxWidth: "none",
          height: "min(860px, 92vh)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="font-['Inter',sans-serif] text-2xl text-[#1a2535]">
            {t("jobs.positionForm.createTitle")}
          </DialogTitle>

          <DialogDescription>
            {t("jobs.positionForm.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <JobPositionForm
          defaultValues={EMPTY_DEFAULTS}
          submitLabel={t("jobs.positionForm.createSubmit")}
          pending={createPosition.isPending}
          onCancel={close}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
