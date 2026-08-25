import { useOrgUnitDetailForJobs } from "@/features/hr/jobs/api/use-job-positions";
import { OrgConnector, OrgNode } from "@/features/hr/jobs/components/org-node";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function JobPositionOrganizationTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const unit = useOrgUnitDetailForJobs(position.orgUnitId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>Organization Unit</SectionTitle>

        <div className="flex flex-col gap-2">
          <InfoRow label="Unit" value={position.orgUnitName} />
          <InfoRow label="Unit Code" value={position.orgUnitCode} />
          <InfoRow label="Unit Type" value={unit.data?.type} />
          <InfoRow label="Parent Unit" value={unit.data?.parentUnit} />
          <InfoRow label="Organization" value={position.organizationName} />
          <InfoRow label="Manager" value={unit.data?.manager} />
        </div>
      </section>

      <section>
        <SectionTitle>Unit Hierarchy</SectionTitle>

        <OrgNode title={position.organizationName ?? ""} subtitle="Organization" />

        {unit.data?.parentUnit && (
          <>
            <OrgConnector />
            <OrgNode title={unit.data.parentUnit} subtitle="Parent Unit" />
          </>
        )}

        <OrgConnector />

        <OrgNode
          title={position.orgUnitName ?? ""}
          subtitle={position.orgUnitCode ?? undefined}
          highlight
        />
      </section>
    </div>
  );
}
