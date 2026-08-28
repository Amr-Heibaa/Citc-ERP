import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteEmployeeDialog } from "@/features/hr/employees/components/delete-employee-dialog";
import { EmploymentTab } from "@/features/hr/employees/components/employee-employment-tab";
import { HistoryTab } from "@/features/hr/employees/components/employee-history-tab";
import { OverviewTab } from "@/features/hr/employees/components/employee-overview-tab";
import { PersonalTab } from "@/features/hr/employees/components/employee-personal-tab";
import { ContractsTab } from "@/features/hr/employees/components/employee-contracts-tab";
import { printEmployeeProfiles } from "@/features/hr/employees/utils/employee-profile-export";
import type { EmployeeDetail } from "@/lib/api/generated/model";

const TAB_TRIGGER_CLASS =
  "h-12 flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 shadow-none data-[state=active]:border-[#f5841f] data-[state=active]:bg-transparent data-[state=active]:text-[#f5841f]";

const TAB_VALUES = ["overview", "personal", "employment", "contracts", "history"];

export function EmployeeDetailTabs({ emp }: { emp: EmployeeDetail }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const requestedTab = searchParams.get("tab");
  const activeTab = TAB_VALUES.includes(requestedTab ?? "") ? requestedTab! : "overview";

  function handleTabChange(value: string) {
    setSearchParams(
      (params) => {
        if (value === "overview") {
          params.delete("tab");
        } else {
          params.set("tab", value);
        }
        return params;
      },
      { replace: true },
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-0">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <TabsList className="h-auto w-max gap-7 rounded-none bg-transparent p-0">
              <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
                Overview
              </TabsTrigger>

              <TabsTrigger value="personal" className={TAB_TRIGGER_CLASS}>
                Personal Information
              </TabsTrigger>

              <TabsTrigger value="employment" className={TAB_TRIGGER_CLASS}>
                Employment
              </TabsTrigger>

              <TabsTrigger value="contracts" className={TAB_TRIGGER_CLASS}>
                Contracts
              </TabsTrigger>

              <TabsTrigger value="history" className={TAB_TRIGGER_CLASS}>
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => printEmployeeProfiles([emp])}
            >
              <Download className="size-4" />
              Export Profile
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/hr/employees/${emp.employeeId}/edit`)}
            >
              Edit Employee
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <TabsContent value="overview">
            <OverviewTab emp={emp} />
          </TabsContent>

          <TabsContent value="personal">
            <PersonalTab emp={emp} />
          </TabsContent>

          <TabsContent value="employment">
            <EmploymentTab emp={emp} />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsTab emp={emp} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab history={emp.history ?? []} />
          </TabsContent>
        </div>
      </Tabs>

      <DeleteEmployeeDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        employeeId={emp.employeeId ?? 0}
        employeeName={emp.displayName ?? "This employee"}
        onDeleted={() => navigate("/hr/employees")}
      />
    </div>
  );
}
