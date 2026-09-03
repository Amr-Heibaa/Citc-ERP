import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  useOrgUnitDetailForJobs,
  useOrgUnitsForJobs,
} from "@/features/hr/jobs/api/use-job-positions";
import { OrgConnector, OrgNode } from "@/features/hr/jobs/components/org-node";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function JobPositionOrganizationTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const unit = useOrgUnitDetailForJobs(position.orgUnitId);
  const orgUnits = useOrgUnitsForJobs(position.organizationId);

  const childUnits = (orgUnits.data ?? []).filter(
    (candidate) => candidate.parentUnitId === position.orgUnitId,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>{t("jobs.positionDetail.organization.organizationUnit")}</SectionTitle>

        <div className="flex flex-col gap-2">
          <InfoRow label={t("jobs.positionDetail.organization.unit")} value={position.orgUnitName} />
          <InfoRow label={t("jobs.positionDetail.organization.unitCode")} value={position.orgUnitCode} />
          <InfoRow label={t("jobs.positionDetail.organization.unitType")} value={unit.data?.type} />
          <InfoRow label={t("jobs.positionDetail.organization.parentUnit")} value={unit.data?.parentUnit} />
          <InfoRow label={t("jobs.positionDetail.organization.organization")} value={position.organizationName} />
          <InfoRow label={t("jobs.positionDetail.organization.manager")} value={unit.data?.manager} />
          <InfoRow label={t("jobs.positionDetail.organization.status")} value={unit.data?.status} />
        </div>

        {position.organizationId != null && position.orgUnitId != null && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() =>
              navigate(
                `/hr/organizations/${position.organizationId}/units/${position.orgUnitId}`,
              )
            }
          >
            {t("jobs.positionDetail.organization.viewUnitDetails")}
          </Button>
        )}
      </section>

      <section>
        <SectionTitle>{t("jobs.positionDetail.organization.unitHierarchy")}</SectionTitle>

        <OrgNode
          title={position.organizationName ?? ""}
          subtitle={t("jobs.positionDetail.organization.organizationSubtitle")}
        />

        {unit.data?.parentUnit && (
          <>
            <OrgConnector />
            <OrgNode
              title={unit.data.parentUnit}
              subtitle={t("jobs.positionDetail.organization.parentUnitSubtitle")}
            />
          </>
        )}

        <OrgConnector />

        <OrgNode
          title={position.orgUnitName ?? ""}
          subtitle={position.orgUnitCode ?? undefined}
          highlight
        />

        {childUnits.length > 0 && (
          <>
            <OrgConnector />

            <div className="flex flex-wrap justify-center gap-3">
              {childUnits.map((child) => (
                <OrgNode key={child.id} title={child.name ?? ""} subtitle={child.type} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
