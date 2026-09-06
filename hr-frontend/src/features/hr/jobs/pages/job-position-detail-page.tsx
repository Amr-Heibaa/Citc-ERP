import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useJobPositionDetail } from "@/features/hr/jobs/api/use-job-positions";
import { JobPositionDetailHero } from "@/features/hr/jobs/components/job-position-detail-hero";
import { JobPositionDetailTabs } from "@/features/hr/jobs/components/job-position-detail-tabs";

export function JobPositionDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { positionId } = useParams();
  const id = Number(positionId);
  const { data: position, isLoading, isError } = useJobPositionDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-gray-400">
        {t("jobs.positionForm.loading")}
      </div>
    );
  }

  if (isError || !position) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">{t("jobs.positionForm.notFound")}</p>

        <Button variant="outline" onClick={() => navigate("/hr/jobs/positions")}>
          {t("jobs.positionForm.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <JobPositionDetailHero position={position} />
      <JobPositionDetailTabs position={position} />
    </div>
  );
}
