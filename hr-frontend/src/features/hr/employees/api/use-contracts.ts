import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createContract,
  endContract,
  renewContract,
  updateContract,
  useGetContract,
  useListContracts,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";

import type {
  CreateContractRequest,
  EndContractRequest,
  UpdateContractRequest,
} from "@/lib/api/generated/model";

import {
  contractDetailQueryKey,
  contractListQueryKey,
  employeeDetailQueryKey,
  isEmployeeQueryKey,
} from "@/features/hr/employees/api/query-keys";

function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function useContracts(employeeId: number, page = 0, size = 20) {
  return useListContracts(
    employeeId,
    { page, size },
    { query: { enabled: isValidId(employeeId) } },
  );
}

export function useContractDetail(employeeId: number, contractId: number) {
  return useGetContract(employeeId, contractId, {
    query: { enabled: isValidId(employeeId) && isValidId(contractId) },
  });
}

function useInvalidateContracts(employeeId: number) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) => isEmployeeQueryKey(query.queryKey),
      }),
      queryClient.invalidateQueries({
        queryKey: contractListQueryKey(employeeId),
      }),
      queryClient.invalidateQueries({
        queryKey: employeeDetailQueryKey(employeeId),
      }),
    ]);
  };
}

export function useCreateContract(employeeId: number) {
  const invalidate = useInvalidateContracts(employeeId);

  return useMutation({
    mutationFn: (request: CreateContractRequest) =>
      createContract(employeeId, request),

    onSuccess: invalidate,
  });
}

export function useUpdateContract(employeeId: number, contractId: number) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateContracts(employeeId);

  return useMutation({
    mutationFn: (request: UpdateContractRequest) =>
      updateContract(employeeId, contractId, request),

    onSuccess: async () => {
      await invalidate();
      await queryClient.invalidateQueries({
        queryKey: contractDetailQueryKey(employeeId, contractId),
      });
    },
  });
}

export function useEndContract(employeeId: number, contractId: number) {
  const invalidate = useInvalidateContracts(employeeId);

  return useMutation({
    mutationFn: (request: EndContractRequest) =>
      endContract(employeeId, contractId, request),

    onSuccess: invalidate,
  });
}

export function useRenewContract(employeeId: number, contractId: number) {
  const invalidate = useInvalidateContracts(employeeId);

  return useMutation({
    mutationFn: (request: CreateContractRequest) =>
      renewContract(employeeId, contractId, request),

    onSuccess: invalidate,
  });
}
