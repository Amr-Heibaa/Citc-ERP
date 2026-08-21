import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeContractImportDialog } from "@/features/hr/employees/components/employee-contract-import-dialog";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { EmployeeDetail } from "@/lib/api/generated/model";

function ContractValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="font-['Inter',sans-serif] text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 font-['Inter',sans-serif] text-xs font-medium text-[#1a2535]">
        {value}
      </p>
    </div>
  );
}

export function ContractsTab({ emp }: { emp: EmployeeDetail }) {
  const contracts = emp.contracts ?? [];
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1a2535]">
            Employee Contracts
          </p>

          <p className="text-xs text-gray-400">{contracts.length} contract(s)</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setImportOpen(true)}
        >
          <FileSpreadsheet className="mr-2 size-4" />
          Import Contracts
        </Button>
      </div>

      {contracts.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center font-['Inter',sans-serif] text-sm text-gray-400">
          No contracts on file.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contracts.map((contract) => (
            <div
              key={contract.contractId}
              className="rounded-xl border border-gray-100 bg-[#f4f6f9] p-4"
            >
              <div className="mb-1 flex items-start justify-between">
                <div>
                  <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
                    Contract #{contract.contractNumber ?? contract.contractId}
                  </p>

                  {contract.contractTypeName && (
                    <p className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500">
                      {contract.contractTypeName}
                    </p>
                  )}

                  {contract.salary != null && (
                    <p className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500">
                      Salary : {contract.salary} {contract.salaryCurrency}
                    </p>
                  )}
                </div>

                <Badge
                  className={`border-0 ${
                    contract.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {contract.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-1 font-['Inter',sans-serif] text-xs text-gray-400">
                📅 {formatDate(contract.startDate)} -{" "}
                {contract.endDate ? formatDate(contract.endDate) : "Ongoing"}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <ContractValue
                  label="Work Type"
                  value={
                    contract.fulltime == null
                      ? "—"
                      : contract.fulltime
                        ? "Full Time"
                        : "Part Time"
                  }
                />

                <ContractValue
                  label="Probation"
                  value={
                    contract.probationPeriodDays != null
                      ? `${contract.probationPeriodDays} days`
                      : "—"
                  }
                />

                <ContractValue
                  label="Hours / Week"
                  value={contract.workingHoursPerWeek ?? "—"}
                />

                <ContractValue
                  label="Hours / Month"
                  value={contract.workingHoursPerMonth ?? "—"}
                />
              </div>

              {contract.notes && (
                <p className="mt-3 whitespace-pre-wrap border-t border-gray-200 pt-3 font-['Inter',sans-serif] text-xs leading-5 text-gray-500">
                  {contract.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <EmployeeContractImportDialog
        employeeId={emp.employeeId ?? 0}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}
