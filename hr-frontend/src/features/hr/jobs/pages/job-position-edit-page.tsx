import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useJobPositionDetail,
  useUpdateJobPosition,
} from "@/features/hr/jobs/api/use-job-positions";
import { JobPositionForm } from "@/features/hr/jobs/components/job-position-form-dialog";
import {
  jobPositionDetailToFormValues,
  toUpdateJobPositionRequest,
} from "@/features/hr/jobs/schemas/job-position-mappers";
import type { JobPositionFormValues } from "@/features/hr/jobs/schemas/job-position-schema";

export function JobPositionEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { positionId } = useParams();
  const id = Number(positionId);

  const position = useJobPositionDetail(id);
  const updatePosition = useUpdateJobPosition(id);

  function close() {
    navigate(`/hr/jobs/positions/${id}`);
  }

  async function handleSubmit(values: JobPositionFormValues) {
    try {
      await updatePosition.mutateAsync(toUpdateJobPositionRequest(values));
      toast.success(t("jobs.positionForm.editSuccess"));
      close();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : t("jobs.positionForm.editError");

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
            {t("jobs.positionForm.editTitle")}
          </DialogTitle>

          <DialogDescription>
            {t("jobs.positionForm.editDescription")}
          </DialogDescription>
        </DialogHeader>

        {position.isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-400">
            {t("jobs.positionForm.loading")}
          </div>
        ) : position.isError || !position.data ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">{t("jobs.positionForm.notFound")}</p>

            <Button variant="outline" onClick={() => navigate("/hr/jobs/positions")}>
              {t("jobs.positionForm.backToPositions")}
            </Button>
          </div>
        ) : (
          <JobPositionForm
            defaultValues={jobPositionDetailToFormValues(position.data)}
            excludePositionId={id}
            submitLabel={t("jobs.positionForm.saveChanges")}
            pending={updatePosition.isPending}
            onCancel={close}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
