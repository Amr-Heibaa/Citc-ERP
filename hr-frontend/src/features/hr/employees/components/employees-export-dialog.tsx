import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useEmployeesFiltersStore,
  type EmployeeExportFormat,
} from "@/features/hr/employees/store/employees-filters-store";
import {
  downloadCsv,
  downloadExcel,
  printEmployees,
} from "@/features/hr/employees/utils/employee-export";
import { useFetchEmployeeDetails } from "@/features/hr/employees/api/use-employees";
import { printEmployeeProfiles } from "@/features/hr/employees/utils/employee-profile-export";
import type { EmployeeSummary } from "@/lib/api/generated/model";

const FORMATS: EmployeeExportFormat[] = ["CSV", "Excel", "PDF", "Full Profile PDF"];

const FORMAT_LABEL_KEYS: Record<EmployeeExportFormat, string> = {
  CSV: "employees.export.csv",
  Excel: "employees.export.excel",
  PDF: "employees.export.pdf",
  "Full Profile PDF": "employees.export.fullProfilePdf",
};

const FORMAT_DESCRIPTION_KEYS: Record<EmployeeExportFormat, string> = {
  CSV: "employees.export.csvDescription",
  Excel: "employees.export.excelDescription",
  PDF: "employees.export.pdfDescription",
  "Full Profile PDF": "employees.export.fullProfilePdfDescription",
};

export function EmployeesExportDialog({
  employees,
}: {
  employees: EmployeeSummary[];
}) {
  const { t } = useTranslation();
  const exportOpen = useEmployeesFiltersStore((state) => state.exportOpen);
  const setExportOpen = useEmployeesFiltersStore(
    (state) => state.setExportOpen,
  );
  const exportFormat = useEmployeesFiltersStore((state) => state.exportFormat);
  const setExportFormat = useEmployeesFiltersStore(
    (state) => state.setExportFormat,
  );

  const fetchDetails = useFetchEmployeeDetails();

  async function handleExport() {
    if (employees.length === 0) {
      toast.error(t("employees.export.noEmployeesToExport"));
      return;
    }

    try {
      if (exportFormat === "CSV") {
        downloadCsv(employees);
      } else if (exportFormat === "Excel") {
        await downloadExcel(employees);
      } else if (exportFormat === "PDF") {
        printEmployees(employees);
      } else {
        const employeeIds = employees
          .map((employee) => employee.employeeId)
          .filter((id): id is number => Number.isInteger(id));

        const details = await fetchDetails.mutateAsync(employeeIds);

        printEmployeeProfiles(details, {
          title: t("employees.export.employeeProfiles"),
          subtitle: t("employees.export.employeeRecordsCount", { count: details.length }),
        });
      }

      setExportOpen(false);

      toast.success(t("employees.export.exported", { count: employees.length }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("employees.export.unableToExport");

      toast.error(message);
    }
  }

  return (
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>{t("employees.export.title")}</DialogTitle>

          <DialogDescription>
            {t("employees.export.description", { count: employees.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {FORMATS.map((format) => (
            <label
              key={format}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                exportFormat === format
                  ? "border-[#f5841f] bg-orange-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="export-format"
                checked={exportFormat === format}
                onChange={() => setExportFormat(format)}
                className="accent-[#f5841f]"
              />

              <div>
                <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                  {t(FORMAT_LABEL_KEYS[format])}
                </p>

                <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                  {t(FORMAT_DESCRIPTION_KEYS[format])}
                </p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setExportOpen(false)}>
            {t("common.cancel")}
          </Button>

          <Button
            onClick={handleExport}
            disabled={fetchDetails.isPending}
            className="bg-[#1a2535] text-white hover:bg-[#243347]"
          >
            <Download className="size-4" />
            {fetchDetails.isPending
              ? t("employees.export.preparing")
              : t("employees.export.exportButton", { format: t(FORMAT_LABEL_KEYS[exportFormat]) })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
