import { Calendar, FileText, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContractDocuments } from "@/features/hr/employees/api/use-contract-documents";
import { useContracts } from "@/features/hr/employees/api/use-contracts";
import { ContractDocumentsDialog } from "@/features/hr/employees/components/contract-documents-dialog";
import { ContractFormDialog } from "@/features/hr/employees/components/contract-form-dialog";
import { EndContractDialog } from "@/features/hr/employees/components/end-contract-dialog";
import { RenewContractDialog } from "@/features/hr/employees/components/renew-contract-dialog";
import { downloadContractDocumentFile } from "@/features/hr/employees/utils/contract-document-download";
import {
  downloadContractExport,
  type ContractExportFormat,
} from "@/features/hr/employees/utils/contract-export";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { ContractDetail, EmployeeDetail } from "@/lib/api/generated/model";

const EXPORT_FORMAT_LABELS: Record<ContractExportFormat, string> = {
  pdf: "Export as PDF",
  xlsx: "Export as Excel",
  docx: "Export as Word",
};

function ContractCard({
  contract,
  employeeId,
  onEdit,
  onDocuments,
  onRenew,
  onEnd,
}: {
  contract: ContractDetail;
  employeeId: number;
  onEdit: () => void;
  onDocuments: () => void;
  onRenew: () => void;
  onEnd: () => void;
}) {
  const { t } = useTranslation();
  const contractId = contract.contractId ?? 0;

  const documents = useContractDocuments(employeeId, contractId);
  const currentDocument = documents.data?.find((doc) => doc.current);

  function handleCardClick() {
    if (currentDocument?.contractDocumentId != null) {
      downloadContractDocumentFile(
        employeeId,
        contractId,
        currentDocument.contractDocumentId,
        currentDocument.fileName ?? `contract-${contractId}-document`,
      ).catch(() => {
        toast.error(t("employees.contractsTab.documentsDialog.unableToLoad"));
      });
    } else {
      onDocuments();
    }
  }

  async function handleExport(format: ContractExportFormat) {
    try {
      await downloadContractExport(employeeId, contractId, format);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to export contract",
      );
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
      title={
        currentDocument
          ? t("employees.contractsTab.documentsDialog.download")
          : t("employees.contractsTab.documents")
      }
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
            {t("employees.contractsTab.contractNumber", { number: contract.contractNumber ?? contract.contractId })}
          </p>

          {contract.contractTypeName && (
            <p className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500">
              {contract.contractTypeName}
            </p>
          )}

          {contract.salary != null && (
            <p className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500">
              {t("employees.contractsTab.salary", { amount: contract.salary, currency: contract.salaryCurrency })}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-md text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 focus:opacity-100 group-hover:opacity-100"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                {t("employees.contractsTab.edit")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onDocuments}>
                {t("employees.contractsTab.documents")}
              </DropdownMenuItem>

              {contract.active && (
                <DropdownMenuItem onClick={onRenew}>
                  {t("employees.contractsTab.renew")}
                </DropdownMenuItem>
              )}

              {contract.active && (
                <DropdownMenuItem onClick={onEnd} className="text-red-600">
                  {t("employees.contractsTab.end")}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {(Object.keys(EXPORT_FORMAT_LABELS) as ContractExportFormat[]).map((format) => (
                <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
                  {EXPORT_FORMAT_LABELS[format]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Badge
            className={`shrink-0 border-0 ${
              contract.active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {contract.active ? t("employees.contractsTab.active") : t("employees.contractsTab.expired")}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 font-['Inter',sans-serif] text-xs text-gray-400">
        <Calendar className="size-3.5" />
        {formatDate(contract.startDate)} -{" "}
        {contract.endDate ? formatDate(contract.endDate) : t("employees.contractsTab.ongoing")}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDocuments();
        }}
        title={t("employees.contractsTab.documents")}
        className="absolute bottom-3 right-3 flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600 transition-colors hover:bg-sky-200"
      >
        <FileText className="size-3.5" />
      </button>
    </div>
  );
}

export function ContractsTab({ emp }: { emp: EmployeeDetail }) {
  const { t } = useTranslation();
  const employeeId = emp.employeeId ?? 0;

  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractDetail | undefined>();
  const [endTarget, setEndTarget] = useState<ContractDetail | undefined>();
  const [renewTarget, setRenewTarget] = useState<ContractDetail | undefined>();
  const [documentsTarget, setDocumentsTarget] = useState<ContractDetail | undefined>();

  const contracts = useContracts(employeeId);
  const rows = contracts.data?.items ?? [];
  const activeRows = rows.filter((row) => row.active);
  const inactiveRows = rows.filter((row) => !row.active);
  const hasActiveContract = activeRows.length > 0;

  function openCardActions(contract: ContractDetail, action: "edit" | "renew" | "end") {
    if (action === "edit") {
      setEditingContract(contract);
      setFormOpen(true);
    } else if (action === "renew") {
      setRenewTarget(contract);
    } else {
      setEndTarget(contract);
    }
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {contracts.isLoading ? (
        <div className="rounded-xl border border-dashed py-10 text-center font-['Inter',sans-serif] text-sm text-gray-400">
          {t("employees.contractsTab.loading")}
        </div>
      ) : (
        <>
          {hasActiveContract ? (
            <div className="flex flex-col gap-3">
              <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                {t("employees.contractsTab.activeSection")}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeRows.map((contract) => (
                  <ContractCard
                    key={contract.contractId}
                    contract={contract}
                    employeeId={employeeId}
                    onEdit={() => openCardActions(contract, "edit")}
                    onDocuments={() => setDocumentsTarget(contract)}
                    onRenew={() => openCardActions(contract, "renew")}
                    onEnd={() => openCardActions(contract, "end")}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fb] px-4 py-3">
              <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                {t("employees.contractsTab.noContracts")}
              </p>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingContract(undefined);
                  setFormOpen(true);
                }}
              >
                {t("employees.contractsTab.addContract")}
              </Button>
            </div>
          )}

          {inactiveRows.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                {t("employees.contractsTab.notActiveSection")}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactiveRows.map((contract) => (
                  <ContractCard
                    key={contract.contractId}
                    contract={contract}
                    employeeId={employeeId}
                    onEdit={() => openCardActions(contract, "edit")}
                    onDocuments={() => setDocumentsTarget(contract)}
                    onRenew={() => openCardActions(contract, "renew")}
                    onEnd={() => openCardActions(contract, "end")}
                  />
                ))}
              </div>
            </div>
          )}
        </>
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

      {documentsTarget && (
        <ContractDocumentsDialog
          open={documentsTarget != null}
          onOpenChange={(next) => !next && setDocumentsTarget(undefined)}
          employeeId={employeeId}
          contract={documentsTarget}
        />
      )}
    </div>
  );
}
