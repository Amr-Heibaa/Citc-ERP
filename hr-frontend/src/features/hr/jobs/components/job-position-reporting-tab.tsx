import { useMemo } from "react";
import { useNavigate } from "react-router";

import { useJobPositionHierarchy } from "@/features/hr/jobs/api/use-job-positions";
import { OrgConnector, OrgNode } from "@/features/hr/jobs/components/org-node";
import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import type {
  JobPositionDetail,
  JobPositionHierarchyNode,
} from "@/lib/api/generated/model";

function findNode(
  nodes: JobPositionHierarchyNode[],
  positionId: number,
): JobPositionHierarchyNode | undefined {
  for (const node of nodes) {
    if (node.positionId === positionId) {
      return node;
    }

    const found = findNode(node.children ?? [], positionId);

    if (found) {
      return found;
    }
  }

  return undefined;
}

export function JobPositionReportingTab({
  position,
}: {
  position: JobPositionDetail;
}) {
  const navigate = useNavigate();

  const hierarchy = useJobPositionHierarchy({
    organizationId: position.organizationId,
  });

  const currentNode = useMemo(() => {
    if (!hierarchy.data || position.positionId == null) {
      return undefined;
    }

    return findNode(hierarchy.data, position.positionId);
  }, [hierarchy.data, position.positionId]);

  const directReports = currentNode?.children ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <SectionTitle>Reports To Position</SectionTitle>

        <div className="flex flex-col gap-2">
          <InfoRow label="Position" value={position.reportsToPositionTitle} />
          <InfoRow label="Position Code" value={position.reportsToPositionCode} />
          <InfoRow label="Direct Reports" value={position.directReportsCount ?? 0} />
        </div>
      </section>

      <section>
        <SectionTitle>Reporting Hierarchy</SectionTitle>

        {position.reportsToPositionTitle && (
          <>
            <OrgNode
              title={position.reportsToPositionTitle}
              subtitle={position.reportsToPositionCode ?? undefined}
            />
            <OrgConnector />
          </>
        )}

        <OrgNode
          title={position.titleEn ?? ""}
          subtitle={position.code ?? undefined}
          highlight
        />

        {directReports.length > 0 && (
          <>
            <OrgConnector />

            <div className="flex flex-wrap justify-center gap-3">
              {directReports.map((child) => (
                <button
                  key={child.positionId}
                  type="button"
                  onClick={() => navigate(`/hr/jobs/positions/${child.positionId}`)}
                >
                  <OrgNode
                    title={child.titleEn ?? ""}
                    subtitle={child.assignedEmployeeName ?? child.code ?? undefined}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
