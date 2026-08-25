import { Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobPositionAssignmentsTab } from "@/features/hr/jobs/components/job-position-assignments-tab";
import { JobPositionEmployeeTab } from "@/features/hr/jobs/components/job-position-employee-tab";
import { JobPositionHistoryTab } from "@/features/hr/jobs/components/job-position-history-tab";
import { JobPositionOrganizationTab } from "@/features/hr/jobs/components/job-position-organization-tab";
import { JobPositionOverviewTab } from "@/features/hr/jobs/components/job-position-overview-tab";
import { JobPositionReportingTab } from "@/features/hr/jobs/components/job-position-reporting-tab";
import type { JobPositionDetail } from "@/lib/api/generated/model";

const TRIGGER_CLASS =
  "h-10 flex-none rounded-none border-0 border-b-2 border-b-transparent bg-transparent px-4 py-0 text-xs font-medium shadow-none hover:text-[#f5841f] data-[state=active]:border-b-[#f5841f] data-[state=active]:bg-transparent data-[state=active]:text-[#f5841f] data-[state=active]:shadow-none";

export function JobPositionDetailTabs({
  position,
}: {
  position: JobPositionDetail;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
        <div className="flex min-h-10 flex-col border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 w-auto justify-start overflow-x-auto rounded-none bg-transparent p-0">
            <TabsTrigger value="overview" className={TRIGGER_CLASS}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="employee" className={TRIGGER_CLASS}>
              Employee
            </TabsTrigger>
            <TabsTrigger value="organization" className={TRIGGER_CLASS}>
              Organization
            </TabsTrigger>
            <TabsTrigger value="reporting" className={TRIGGER_CLASS}>
              Reporting
            </TabsTrigger>
            <TabsTrigger value="assignments" className={TRIGGER_CLASS}>
              Assignments
            </TabsTrigger>
            <TabsTrigger value="history" className={TRIGGER_CLASS}>
              History
            </TabsTrigger>
          </TabsList>

          <div className="flex h-10 items-center px-3">
            <Button
              size="sm"
              onClick={() => navigate(`/hr/jobs/positions/${position.positionId}/edit`)}
            >
              <Pencil className="size-4" />
              Edit Position
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="p-5">
          <JobPositionOverviewTab position={position} />
        </TabsContent>

        <TabsContent value="employee" className="p-5">
          <JobPositionEmployeeTab position={position} />
        </TabsContent>

        <TabsContent value="organization" className="p-5">
          <JobPositionOrganizationTab position={position} />
        </TabsContent>

        <TabsContent value="reporting" className="p-5">
          <JobPositionReportingTab position={position} />
        </TabsContent>

        <TabsContent value="assignments" className="p-5">
          <JobPositionAssignmentsTab position={position} />
        </TabsContent>

        <TabsContent value="history" className="p-5">
          <JobPositionHistoryTab positionId={position.positionId ?? 0} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
