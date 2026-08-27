import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadContractExport,
  downloadContractsExport,
  type ContractExportFormat,
} from "@/features/hr/employees/utils/contract-export";

const FORMAT_LABELS: Record<ContractExportFormat, string> = {
  pdf: "PDF",
  xlsx: "Excel (XLSX)",
  docx: "Word (DOCX)",
};

export function ContractExportMenu({
  employeeId,
  contractId,
  label = "Export",
}: {
  employeeId: number;
  contractId?: number;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleExport(format: ContractExportFormat) {
    setPending(true);

    try {
      if (contractId != null) {
        await downloadContractExport(employeeId, contractId, format);
      } else {
        await downloadContractsExport(employeeId, format);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to export contract",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={pending}>
          <Download className="size-3.5" />
          {label}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {(Object.keys(FORMAT_LABELS) as ContractExportFormat[]).map((format) => (
          <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
            {FORMAT_LABELS[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
