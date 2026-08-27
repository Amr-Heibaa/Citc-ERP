import { axiosInstance } from "@/lib/api/axios";

export type ContractExportFormat = "pdf" | "xlsx" | "docx";

const FILE_EXTENSION: Record<ContractExportFormat, string> = {
  pdf: "pdf",
  xlsx: "xlsx",
  docx: "docx",
};

// The generated exportContract(s) functions type the response as `string`
// (the backend documents it as a byte-format schema), but the endpoint
// actually streams binary PDF/XLSX/DOCX bytes. We call axios directly with
// responseType: "blob" instead of going through the generated client.
async function downloadBlob(
  url: string,
  format: ContractExportFormat,
  filename: string,
) {
  const response = await axiosInstance.get(url, {
    params: { format },
    responseType: "blob",
  });

  const blob = response.data as Blob;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `${filename}.${FILE_EXTENSION[format]}`;

  link.click();
  URL.revokeObjectURL(objectUrl);
}

export function downloadContractsExport(
  employeeId: number,
  format: ContractExportFormat,
) {
  return downloadBlob(
    `/api/hr/employees/${employeeId}/contracts/export`,
    format,
    `contracts-${employeeId}`,
  );
}

export function downloadContractExport(
  employeeId: number,
  contractId: number,
  format: ContractExportFormat,
) {
  return downloadBlob(
    `/api/hr/employees/${employeeId}/contracts/${contractId}/export`,
    format,
    `contract-${contractId}`,
  );
}
