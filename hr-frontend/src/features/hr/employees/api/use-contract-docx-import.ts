import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmDocxImport,
  previewDocxImport,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";
import type { CreateContractRequest } from "@/lib/api/generated/model";

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

export function useConfirmDocxContractImport(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, contract }: { file: File; contract: CreateContractRequest }) =>
      confirmDocxImport(employeeId, { file, contract }),

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
