import { FileSpreadsheet, Pencil, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContracts } from "@/features/hr/employees/api/use-contracts";
import { ContractExportMenu } from "@/features/hr/employees/components/contract-export-menu";
import { ContractFormDialog } from "@/features/hr/employees/components/contract-form-dialog";
import { EmployeeContractImportDialog } from "@/features/hr/employees/components/employee-contract-import-dialog";
import { EndContractDialog } from "@/features/hr/employees/components/end-contract-dialog";
import { RenewContractDialog } from "@/features/hr/employees/components/renew-contract-dialog";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { ContractDetail, EmployeeDetail } from "@/lib/api/generated/model";

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
  const employeeId = emp.employeeId ?? 0;

  const [importOpen, setImportOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractDetail | undefined>();
  const [endTarget, setEndTarget] = useState<ContractDetail | undefined>();
  const [renewTarget, setRenewTarget] = useState<ContractDetail | undefined>();

  const contracts = useContracts(employeeId);
  const rows = contracts.data?.items ?? [];
  const hasActiveContract = rows.some((row) => row.active);

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1a2535]">
            Employee Contracts
          </p>

          <p className="text-xs text-gray-400">{rows.length} contract(s)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ContractExportMenu employeeId={employeeId} label="Export All" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
          >
            <FileSpreadsheet className="mr-2 size-4" />
            Import Contracts
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={hasActiveContract}
            title={
              hasActiveContract
                ? "This employee already has an active contract — use Renew instead"
                : undefined
            }
            onClick={() => {
              setEditingContract(undefined);
              setFormOpen(true);
            }}
          >
            Add Contract
          </Button>
        </div>
      </div>

      {hasActiveContract && (
        <p className="font-['Inter',sans-serif] text-xs text-gray-400">
          Only one active contract is allowed per employee. To replace the
          active contract, use <span className="font-medium">Renew</span> on
          it below instead of adding a new one.
        </p>
      )}

      {contracts.isLoading ? (
        <div className="rounded-xl border border-dashed py-10 text-center font-['Inter',sans-serif] text-sm text-gray-400">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center font-['Inter',sans-serif] text-sm text-gray-400">
          No contracts on file.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map((contract) => (
            <div
              key={contract.contractId}
              className="rounded-xl border border-gray-100 bg-[#f4f6f9] p-4"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
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
                  className={`shrink-0 border-0 ${
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

              <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingContract(contract);
                    setFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-['Inter',sans-serif] text-xs font-medium text-[#f5841f] transition-colors hover:bg-[#f5841f]/10"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>

                {contract.active && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRenewTarget(contract)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-['Inter',sans-serif] text-xs font-medium text-[#f5841f] transition-colors hover:bg-[#f5841f]/10"
                    >
                      <RefreshCw className="size-3.5" />
                      Renew
                    </button>

                    <button
                      type="button"
                      onClick={() => setEndTarget(contract)}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-['Inter',sans-serif] text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <XCircle className="size-3.5" />
                      End
                    </button>
                  </>
                )}

                <div className="ml-auto">
                  <ContractExportMenu
                    employeeId={employeeId}
                    contractId={contract.contractId}
                    label=""
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContractFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employeeId={employeeId}
        contract={editingContract}
      />

      {endTarget && (
        <EndContractDialog
          open={endTarget != null}
          onOpenChange={(next) => !next && setEndTarget(undefined)}
          employeeId={employeeId}
          contract={endTarget}
        />
      )}

      {renewTarget && (
        <RenewContractDialog
          open={renewTarget != null}
          onOpenChange={(next) => !next && setRenewTarget(undefined)}
          employeeId={employeeId}
          contract={renewTarget}
        />
      )}

      <EmployeeContractImportDialog
        employeeId={employeeId}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}
