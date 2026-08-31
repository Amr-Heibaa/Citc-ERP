import { Pencil, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationDetailBody } from "@/features/hr/organizations/components/organization-detail-body";
import { OrganizationStructureTab } from "@/features/hr/organizations/components/organization-structure-tab";
import { OrganizationUnitFormDialog } from "@/features/hr/organizations/components/organization-unit-form-dialog";
import { OrganizationUnitImportDialog } from "@/features/hr/organizations/components/organization-unit-import-dialog";
import { OrganizationUnitTab } from "@/features/hr/organizations/components/organization-unit-tab";
import type { OrganizationDetail } from "@/lib/api/generated/model";
const TRIGGER_CLASS =
  "h-10 flex-none rounded-none border-0 border-b-2 border-b-transparent bg-transparent px-4 py-0 text-xs font-medium shadow-none hover:text-[#f5841f] data-[state=active]:border-b-[#f5841f] data-[state=active]:bg-transparent data-[state=active]:text-[#f5841f] data-[state=active]:shadow-none";
export function OrganizationDetailTabs({
  organizationId,
  organization,
}: {
  organizationId: number;
  organization: OrganizationDetail;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  const [addUnitOpen, setAddUnitOpen] = useState(false);

  const [importUnitsOpen, setImportUnitsOpen] = useState(false);

  const overviewActive = activeTab === "overview";

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
          <div className="flex min-h-10 flex-col border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="h-10 w-auto justify-start overflow-x-auto rounded-none bg-transparent p-0">
              {" "}
              <TabsTrigger value="overview" className={TRIGGER_CLASS}>
                {t("organizations.detail.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="structure" className={TRIGGER_CLASS}>
                {t("organizations.detail.tabs.structure")}
              </TabsTrigger>
              <TabsTrigger value="units" className={TRIGGER_CLASS}>
                {t("organizations.detail.tabs.units")}
              </TabsTrigger>
            </TabsList>

            <div className="flex h-10 items-center px-3">
              {" "}
              {overviewActive ? (
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/hr/organizations/${organizationId}/edit`)
                  }
                >
                  <Pencil className="size-4" />
                  {t("organizations.detail.editOrganization")}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setImportUnitsOpen(true)}
                  >
                    <Upload className="size-4" />
                    {t("organizations.detail.import")}
                  </Button>

                  <Button size="sm" onClick={() => setAddUnitOpen(true)}>
                    <Plus className="size-4" />
                    {t("organizations.detail.addUnit")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="overview" className="p-5">
            <OrganizationDetailBody organization={organization} />
          </TabsContent>

          <TabsContent value="structure" className="px-5 pb-5">
            <OrganizationStructureTab organizationId={organizationId} />
          </TabsContent>

          <TabsContent value="units" className="px-5 pb-5">
            <OrganizationUnitTab organizationId={organizationId} />
          </TabsContent>
        </Tabs>
      </div>

      <OrganizationUnitFormDialog
        open={addUnitOpen}
        onOpenChange={setAddUnitOpen}
        organizationId={organizationId}
        mode="create"
      />

      <OrganizationUnitImportDialog
        open={importUnitsOpen}
        onOpenChange={setImportUnitsOpen}
        organizationId={organizationId}
      />
    </>
  );
}
