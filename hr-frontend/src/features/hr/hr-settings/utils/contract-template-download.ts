import { axiosInstance } from "@/lib/api/axios";

// The generated downloadTemplate() function types the response as `string`
// (the backend documents it as a byte-format schema), but the endpoint
// actually streams the raw template file bytes. We call axios directly
// with responseType: "blob" instead of going through the generated client,
// matching the pattern used for contract export downloads.
export async function downloadContractTemplateFile(
  templateId: number,
  filename: string,
) {
  const response = await axiosInstance.get(
    `/api/hr/contract-templates/${templateId}/file`,
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
