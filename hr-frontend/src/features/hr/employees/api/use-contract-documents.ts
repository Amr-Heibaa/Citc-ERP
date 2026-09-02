import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  generateContractDocument,
  uploadSignedContractDocument,
  useListContractDocuments,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";

export function useContractDocuments(employeeId: number, contractId: number) {
  return useListContractDocuments(employeeId, contractId, {
    query: {
      enabled:
        Number.isInteger(employeeId) &&
        employeeId > 0 &&
        Number.isInteger(contractId) &&
        contractId > 0,
    },
  });
}

function useInvalidateContractDocuments(employeeId: number, contractId: number) {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: [`/api/hr/employees/${employeeId}/contracts/${contractId}/documents`],
    });
}

export function useGenerateContractDocument(employeeId: number, contractId: number) {
  const invalidate = useInvalidateContractDocuments(employeeId, contractId);

  return useMutation({
    mutationFn: () => generateContractDocument(employeeId, contractId),
    onSuccess: invalidate,
  });
}

export function useUploadSignedDocument(employeeId: number, contractId: number) {
  const invalidate = useInvalidateContractDocuments(employeeId, contractId);

  return useMutation({
    mutationFn: (file: File) =>
      uploadSignedContractDocument(employeeId, contractId, { file }),
    onSuccess: invalidate,
  });
}
