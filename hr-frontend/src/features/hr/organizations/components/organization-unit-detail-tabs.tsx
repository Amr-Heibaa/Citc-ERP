import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationUnitFormDialog } from "@/features/hr/organizations/components/organization-unit-form-dialog";
import { UnitChildUnitsTab } from "@/features/hr/organizations/components/unit-child-units-tab";
import { UnitEmployeesTab } from "@/features/hr/organizations/components/unit-employees-tab";
import { UnitHistoryTab } from "@/features/hr/organizations/components/unit-history-tab";
import { UnitOverviewTab } from "@/features/hr/organizations/components/unit-overview-tab";
import { UnitPositionsTab } from "@/features/hr/organizations/components/unit-positions-tab";
import { UnitRelationshipsTab } from "@/features/hr/organizations/components/unit-relationships-tab";
import type { OrganizationUnitDetail } from "@/lib/api/generated/model";

const TRIGGER_CLASS =
  "h-10 flex-none rounded-none border-0 border-b-2 border-b-transparent bg-transparent px-4 py-0 text-xs font-medium shadow-none hover:text-[#f5841f] data-[state=active]:border-b-[#f5841f] data-[state=active]:bg-transparent data-[state=active]:text-[#f5841f] data-[state=active]:shadow-none";
export function OrganizationUnitDetailTabs({
  organizationId,
  orgUnitId,
  unit,
}: {
  organizationId: number;
  orgUnitId: number;
  unit: OrganizationUnitDetail;
}) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
          {" "}
          <div className="flex min-h-10 flex-col border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-10 w-auto justify-start overflow-x-auto rounded-none bg-transparent p-0">
              {" "}
              <TabsTrigger value="overview" className={TRIGGER_CLASS}>
                {t("organizations.unitDetail.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="employees" className={TRIGGER_CLASS}>
                {t("organizations.unitDetail.tabs.employees")}
              </TabsTrigger>
              <TabsTrigger value="positions" className={TRIGGER_CLASS}>
                {t("organizations.unitDetail.tabs.positions")}
              </TabsTrigger>
              <TabsTrigger value="child-units" className={TRIGGER_CLASS}>
                {t("organizations.unitDetail.tabs.childUnits")}
              </TabsTrigger>
              <TabsTrigger value="relationships" className={TRIGGER_CLASS}>
                {t("organizations.unitDetail.tabs.relationships")}
              </TabsTrigger>
              <TabsTrigger value="history" className={TRIGGER_CLASS}>
                {t("organizations.unitDetail.tabs.history")}
              </TabsTrigger>
            </TabsList>

            <div className="flex h-10 items-center px-3">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                {t("organizations.unitDetail.editUnit")}
              </Button>
            </div>
          </div>
          <TabsContent value="overview" className="px-5 pb-5">
            <UnitOverviewTab unit={unit} onOpenTab={setActiveTab} />
          </TabsContent>
          <TabsContent value="employees" className="p-4">
            <UnitEmployeesTab orgUnitId={orgUnitId} />
          </TabsContent>
          <TabsContent value="positions" className="p-4">
            <UnitPositionsTab orgUnitId={orgUnitId} />
          </TabsContent>
          <TabsContent value="child-units" className="p-4">
            <UnitChildUnitsTab
              organizationId={organizationId}
              orgUnitId={orgUnitId}
            />
          </TabsContent>
          <TabsContent value="relationships" className="p-4">
            <UnitRelationshipsTab
              organizationId={organizationId}
              orgUnitId={orgUnitId}
            />
          </TabsContent>
          <TabsContent value="history" className="p-4">
            <UnitHistoryTab orgUnitId={orgUnitId} />
          </TabsContent>
        </Tabs>
      </div>

      <OrganizationUnitFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        organizationId={organizationId}
        mode="edit"
        unit={unit}
      />
    </>
  );
}
