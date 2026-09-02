import { axiosInstance } from "@/lib/api/axios";

// The generated downloadContractDocument() function types the response as
// `string` (the backend documents it as a byte-format schema), but the
// endpoint actually streams the raw document file bytes. We call axios
// directly with responseType: "blob" instead of going through the
// generated client, matching the pattern used for contract/template
// downloads elsewhere.
export async function downloadContractDocumentFile(
  employeeId: number,
  contractId: number,
  documentId: number,
  filename: string,
) {
  const response = await axiosInstance.get(
    `/api/hr/employees/${employeeId}/contracts/${contractId}/documents/${documentId}/file`,
    { responseType: "blob" },
  );

  const blob = response.data as Blob;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  link.click();
  URL.revokeObjectURL(objectUrl);
}
