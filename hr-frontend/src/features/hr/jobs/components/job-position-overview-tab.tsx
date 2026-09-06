import { PowerOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useUpdateJobPositionStatus } from "@/features/hr/jobs/api/use-job-positions";
import { AssignEmployeeDialog } from "@/features/hr/jobs/components/assign-employee-dialog";
import { OrgConnector, OrgNode } from "@/features/hr/jobs/components/org-node";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import type { JobPositionDetail } from "@/lib/api/generated/model";

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof UserPlus;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-2 py-2 font-['Inter',sans-serif] text-sm font-medium transition-colors ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-[#f5841f] hover:bg-[#f5841f]/10"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export function JobPositionOverviewTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const { t } = useTranslation();
  const [assignOpen, setAssignOpen] = useState(false);
  const updateStatus = useUpdateJobPositionStatus(position.positionId ?? 0);

  async function handleDeactivate() {
    try {
      await updateStatus.mutateAsync({
        active: !(position.active ?? false),
        open: position.open ?? false,
      });

      toast.success(
        position.active
          ? t("jobs.positionDetail.overview.positionDeactivated")
          : t("jobs.positionDetail.overview.positionActivated"),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("jobs.positionDetail.overview.unableToUpdateStatus"),
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>{t("jobs.positionDetail.overview.positionInformation")}</SectionTitle>

        <div className="flex flex-col gap-2">
          <InfoRow label={t("jobs.positionDetail.overview.positionCode")} value={position.code} />
          <InfoRow label={t("jobs.positionDetail.overview.titleEn")} value={position.titleEn} />
          <InfoRow
            label={t("jobs.positionDetail.overview.titleAr")}
            value={<span dir="rtl">{position.titleAr}</span>}
          />
          <InfoRow label={t("jobs.positionDetail.overview.jobGrade")} value={position.gradeName} />
          <InfoRow label={t("jobs.positionDetail.overview.positionLevel")} value={position.positionLevel} />
          <InfoRow
            label={t("jobs.positionDetail.overview.status")}
            value={position.active ? t("common.active") : t("common.inactive")}
          />
          <InfoRow label={t("jobs.positionDetail.overview.occupancy")} value={position.occupancyStatus} />
          <InfoRow label={t("jobs.positionDetail.overview.description")} value={position.descriptionEn} />
        </div>
      </section>

      <div className="space-y-6">
        <section>
          <SectionTitle>{t("jobs.positionDetail.overview.summary")}</SectionTitle>

          <div className="flex flex-col gap-2">
            <InfoRow label={t("jobs.positionDetail.overview.organizationUnit")} value={position.orgUnitName} />
            <InfoRow label={t("jobs.positionDetail.overview.reportsTo")} value={position.reportsToPositionTitle} />
            <InfoRow
              label={t("jobs.positionDetail.overview.currentEmployee")}
              value={position.currentAssignment?.employeeName}
            />
            <InfoRow
              label={t("jobs.positionDetail.overview.directReports")}
              value={position.directReportsCount ?? 0}
            />
          </div>
        </section>

        {position.reportsToPositionTitle && (
          <section>
            <SectionTitle>{t("jobs.positionDetail.overview.reportsToSection")}</SectionTitle>

            <OrgNode
              title={position.reportsToPositionTitle}
              subtitle={position.reportsToPositionCode ?? undefined}
            />

            <OrgConnector />

            <OrgNode title={position.titleEn ?? ""} subtitle={position.code ?? undefined} highlight />
          </section>
        )}

        <section>
          <SectionTitle>{t("jobs.positionDetail.overview.quickActions")}</SectionTitle>

          <div className="flex flex-col gap-1">
            <QuickActionButton
              icon={UserPlus}
              label={
                position.currentAssignment
                  ? t("jobs.positionDetail.overview.changeEmployee")
                  : t("jobs.positionDetail.overview.assignEmployee")
              }
              onClick={() => setAssignOpen(true)}
            />

            <QuickActionButton
              icon={PowerOff}
              label={
                position.active
                  ? t("jobs.positionDetail.overview.deactivatePosition")
                  : t("jobs.positionDetail.overview.activatePosition")
              }
              destructive={position.active ?? false}
              onClick={handleDeactivate}
            />
          </div>
        </section>
      </div>

      <AssignEmployeeDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        position={position}
      />
    </div>
  );
}
