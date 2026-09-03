import type { ContractTypeSetting } from "@/lib/api/generated/model";

import i18n from "@/i18n";
import {
  downloadCsv,
  downloadExcel,
  printTableReport,
} from "@/features/hr/shared/utils/export";

function exportRows(contractTypes: ContractTypeSetting[]) {
  return contractTypes.map((type) => ({
    Code: type.code ?? "",
    Name: type.name ?? "",
    Description: type.description ?? "",
    Status: type.active ? "Active" : "Inactive",
    "Contracts Using This Type": type.usageCount ?? 0,
  }));
}

export function downloadContractTypesCsv(contractTypes: ContractTypeSetting[]) {
  downloadCsv("contract-types-report", exportRows(contractTypes));
}

export async function downloadContractTypesExcel(
  contractTypes: ContractTypeSetting[],
) {
  await downloadExcel(
    "contract-types-report",
    exportRows(contractTypes),
    "Contract Types",
  );
}

export function printContractTypesReport(contractTypes: ContractTypeSetting[]) {
  const totalUsage = contractTypes.reduce(
    (sum, type) => sum + (type.usageCount ?? 0),
    0,
  );

  printTableReport({
    title: i18n.t("reports.contractTypesReport.title"),
    subtitle: i18n.t("reports.contractTypesReport.summary", {
      count: contractTypes.length,
      total: totalUsage,
    }),
    rows: exportRows(contractTypes),
  });
}
