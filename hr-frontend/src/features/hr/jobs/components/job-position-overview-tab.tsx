import { PowerOff, UserPlus } from "lucide-react";
import { useState } from "react";
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
  const [assignOpen, setAssignOpen] = useState(false);
  const updateStatus = useUpdateJobPositionStatus(position.positionId ?? 0);

  async function handleDeactivate() {
    try {
      await updateStatus.mutateAsync({
        active: !(position.active ?? false),
        open: position.open ?? false,
      });

      toast.success(
        position.active ? "Position deactivated" : "Position activated",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update status",
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>Position Information</SectionTitle>

        <div className="flex flex-col gap-2">
          <InfoRow label="Position Code" value={position.code} />
          <InfoRow label="Title (English)" value={position.titleEn} />
          <InfoRow
            label="Title (Arabic)"
            value={<span dir="rtl">{position.titleAr}</span>}
          />
          <InfoRow label="Job Grade" value={position.gradeName} />
          <InfoRow label="Position Level" value={position.positionLevel} />
          <InfoRow label="Status" value={position.active ? "Active" : "Inactive"} />
          <InfoRow label="Occupancy" value={position.occupancyStatus} />
          <InfoRow label="Description" value={position.descriptionEn} />
        </div>
      </section>

      <div className="space-y-6">
        <section>
          <SectionTitle>Summary</SectionTitle>

          <div className="flex flex-col gap-2">
            <InfoRow label="Organization Unit" value={position.orgUnitName} />
            <InfoRow label="Reports To" value={position.reportsToPositionTitle} />
            <InfoRow
              label="Current Employee"
              value={position.currentAssignment?.employeeName}
            />
            <InfoRow
              label="Direct Reports"
              value={position.directReportsCount ?? 0}
            />
          </div>
        </section>

        {position.reportsToPositionTitle && (
          <section>
            <SectionTitle>Reports To</SectionTitle>

            <OrgNode
              title={position.reportsToPositionTitle}
              subtitle={position.reportsToPositionCode ?? undefined}
            />

            <OrgConnector />

            <OrgNode title={position.titleEn ?? ""} subtitle={position.code ?? undefined} highlight />
          </section>
        )}

        <section>
          <SectionTitle>Quick Actions</SectionTitle>

          <div className="flex flex-col gap-1">
            <QuickActionButton
              icon={UserPlus}
              label={position.currentAssignment ? "Change Employee" : "Assign Employee"}
              onClick={() => setAssignOpen(true)}
            />

            <QuickActionButton
              icon={PowerOff}
              label={position.active ? "Deactivate Position" : "Activate Position"}
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
