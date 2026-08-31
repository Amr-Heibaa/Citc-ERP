import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useEmployeeDetail } from "@/features/hr/employees/api/use-employees";
import { EmployeeDetailHero } from "@/features/hr/employees/components/employee-detail-hero";
import { EmployeeDetailTabs } from "@/features/hr/employees/components/employee-detail-tabs";

export function EmployeeDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const id = Number(employeeId);
  const { data: emp, isLoading, isError } = useEmployeeDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-gray-400">
        {t("employees.loadingEmployee")}
      </div>
    );
  }

  if (isError || !emp) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">{t("employees.employeeNotFound")}</p>

        <Button variant="outline" onClick={() => navigate("/hr/employees")}>
          {t("employees.backToList")}
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
