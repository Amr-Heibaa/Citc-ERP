import {
  GitBranchPlus,
  Network,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import { downloadUnitCsv } from "@/features/hr/organizations/utils/organization-unit-export";
import { formatDate } from "@/features/hr/shared/utils/format";
import { OrganizationSummaryRow } from "@/features/hr/organizations/components/organization-summary-row";
import type { OrganizationUnitDetail } from "@/lib/api/generated/model";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "—"
      : value;

  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="font-['Inter',sans-serif] text-xs text-gray-400">
        {label}
      </span>

      <span className="min-w-0 font-['Inter',sans-serif] text-xs font-medium text-[#1a2535]">
        {displayValue}
      </span>
    </div>
  );
}



export function UnitOverviewTab({
  unit,
  onOpenTab,
}: {
  unit: OrganizationUnitDetail;
  onOpenTab: (
    tab:
      | "child-units"
      | "relationships",
  ) => void;
}) {
  const { t } = useTranslation();

  function exportUnitReport() {
    downloadUnitCsv(
      `unit-${unit.id ?? "report"}.csv`,
      [{
        "Unit Code": unit.code,
        "Unit Type": unit.type,
        "Parent Unit":
          unit.parentUnit,
        Manager: unit.manager,
        "Name (English)":
          unit.name,
        "Name (Arabic)":
          unit.nameAr,
        Status: unit.status,
        "Start Date":
          unit.startDate,
        "End Date":
          unit.endDate,
        Employees:
          unit.employees,
        "Active Positions":
          unit.activePositions,
        "Open Positions":
          unit.openPositions,
        "Child Units":
          unit.childUnits,
        Description:
          unit.description,
      }],
    );
  }

  return (
    <div className="grid gap-5 py-4 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-xl border border-gray-200 bg-[#f8f9fb] p-4">
        <h2 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
          {t("organizations.unitOverview.unitInformation")}
        </h2>

        <DetailRow
          label={t("organizations.unitOverview.unitCode")}
          value={unit.code}
        />

        <DetailRow
          label={t("organizations.unitOverview.unitType")}
          value={unit.type}
        />

        <DetailRow
          label={t("organizations.unitOverview.parentUnit")}
          value={unit.parentUnit}
        />

        <DetailRow
          label={t("organizations.unitOverview.manager")}
          value={unit.manager}
        />

        <DetailRow
          label={t("organizations.unitOverview.nameEn")}
          value={unit.name}
        />

        <DetailRow
          label={t("organizations.unitOverview.nameAr")}
          value={
            unit.nameAr ? (
              <span dir="rtl">
                {unit.nameAr}
              </span>
            ) : null
          }
        />

        <DetailRow
          label={t("common.status")}
          value={
            <OrganizationStatusBadge
              status={unit.status}
            />
          }
        />

        <DetailRow
          label={t("organizations.unitOverview.startDate")}
          value={formatDate(
            unit.startDate,
          )}
        />

        <DetailRow
          label={t("organizations.unitOverview.endDate")}
          value={formatDate(
            unit.endDate,
          )}
        />

        <DetailRow
          label={t("common.description")}
          value={unit.description}
        />
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-gray-200 bg-[#f8f9fb] p-4">
          <h2 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
            {t("organizations.unitOverview.summary")}
          </h2>

          <OrganizationSummaryRow
            label={t("organizations.unitOverview.employees")}
            value={unit.employees ?? 0}
          />

          <OrganizationSummaryRow
            label={t("organizations.unitOverview.activePositions")}
            value={
              unit.activePositions ??
              0
            }
          />

          <OrganizationSummaryRow
            label={t("organizations.unitOverview.openPositions")}
            value={
              unit.openPositions ??
              0
            }
          />

          <OrganizationSummaryRow
            label={t("organizations.unitOverview.childUnits")}
            value={
              unit.childUnits ?? 0
            }
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-[#f8f9fb] p-4">
          <h2 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
            {t("organizations.unitOverview.quickActions")}
          </h2>

          <div className="flex flex-col items-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onOpenTab(
                  "child-units",
                )
              }
              className="h-8 gap-2 px-1 text-xs text-[#f5841f] hover:bg-transparent hover:text-[#d96f12]"
            >
              <Plus className="size-3.5" />
              {t("organizations.unitOverview.addChildUnit")}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onOpenTab(
                  "relationships",
                )
              }
              className="h-8 gap-2 px-1 text-xs text-[#f5841f] hover:bg-transparent hover:text-[#d96f12]"
            >
              <GitBranchPlus className="size-3.5" />
              {t("organizations.unitOverview.addRelationship")}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={
                exportUnitReport
              }
              className="h-8 gap-2 px-1 text-xs text-[#f5841f] hover:bg-transparent hover:text-[#d96f12]"
            >
              <Network className="size-3.5" />
              {t("organizations.unitOverview.exportUnitReport")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}