import { useMutation, useQueryClient } from "@tanstack/react-query";

import { axiosInstance } from "@/lib/api/axios";
import { previewDocxImport } from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";
import type { ContractDetail, CreateContractRequest } from "@/lib/api/generated/model";

import {
  contractListQueryKey,
  employeeDetailQueryKey,
  isEmployeeQueryKey,
} from "@/features/hr/employees/api/query-keys";

export function usePreviewDocxContractImport(employeeId: number) {
  return useMutation({
    mutationFn: (file: File) => previewDocxImport(employeeId, { file }),
  });
}

// The generated confirmDocxImport appends the `contract` part with
// formData.append("contract", JSON.stringify(...)), which the browser sends
// with a `text/plain` part Content-Type. The backend binds that part to a
// CreateContractRequest via @RequestPart, which needs an `application/json`
// part Content-Type to deserialize it — otherwise it rejects the whole
// request with 415 Unsupported Media Type. Build the multipart body
// ourselves so the contract part is a Blob carrying the right Content-Type.
async function confirmDocxImportRequest(
  employeeId: number,
  file: File,
  contract: CreateContractRequest,
): Promise<ContractDetail> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "contract",
    new Blob([JSON.stringify(contract)], { type: "application/json" }),
  );

  const { data } = await axiosInstance.post<ContractDetail>(
    `/api/hr/employees/${employeeId}/contracts/import/docx/confirm`,
    formData,
  );

  return data;
}

export function useConfirmDocxContractImport(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, contract }: { file: File; contract: CreateContractRequest }) =>
      confirmDocxImportRequest(employeeId, file, contract),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => isEmployeeQueryKey(query.queryKey),
        }),
        queryClient.invalidateQueries({ queryKey: contractListQueryKey(employeeId) }),
        queryClient.invalidateQueries({ queryKey: employeeDetailQueryKey(employeeId) }),
      ]);
    },
  });
}
