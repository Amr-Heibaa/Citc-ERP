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

      toast.success("Position created successfully");
      navigate(`/hr/jobs/positions/${created.positionId}`);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to create position";

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
            Create Job Position
          </DialogTitle>

          <DialogDescription>
            Add a new position with its grade, unit and reporting line.
          </DialogDescription>
        </DialogHeader>

        <JobPositionForm
          defaultValues={EMPTY_DEFAULTS}
          submitLabel="Create Position"
          pending={createPosition.isPending}
          onCancel={close}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
