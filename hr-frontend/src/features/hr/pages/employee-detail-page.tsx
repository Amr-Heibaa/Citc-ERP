import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useEmployeeDetail } from "@/features/hr/api/use-employees";
import { EmployeeDetailHero } from "@/features/hr/components/employee-detail-hero";
import { EmployeeDetailTabs } from "@/features/hr/widgets/employee-detail-tabs";

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const id = Number(employeeId);
  const { data: emp, isLoading, isError } = useEmployeeDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-gray-400">
        Loading employee…
      </div>
    );
  }

  if (isError || !emp) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">Employee not found.</p>

        <Button variant="outline" onClick={() => navigate("/hr/employees")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <EmployeeDetailHero emp={emp} />
      <EmployeeDetailTabs emp={emp} />
    </div>
  );
}
