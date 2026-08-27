import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createContractType,
  updateContractType,
  updateContractTypeActive,
  useGetContractType,
  useListContractTypes,
} from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

import type {
  ContractTypeSettingRequest,
  UpdateHrSettingActiveRequest,
} from "@/lib/api/generated/model";

import { isHrSettingsQueryKey } from "@/features/hr/hr-settings/api/query-keys";

export function useContractTypeSettings(
  search?: string,
  active?: boolean,
  page = 0,
  size = 20,
) {
  return useListContractTypes({ search, active, page, size });
}

export function useContractTypeDetail(contractTypeId: number) {
  return useGetContractType(contractTypeId, {
    query: { enabled: Number.isInteger(contractTypeId) && contractTypeId > 0 },
  });
}

function useInvalidateContractTypes() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => isHrSettingsQueryKey(query.queryKey),
    });
}

export function useCreateContractTypeSetting() {
  const invalidate = useInvalidateContractTypes();

  return useMutation({
    mutationFn: (request: ContractTypeSettingRequest) => createContractType(request),
    onSuccess: invalidate,
  });
}

export function useUpdateContractTypeSetting(contractTypeId: number) {
  const invalidate = useInvalidateContractTypes();

  return useMutation({
    mutationFn: (request: ContractTypeSettingRequest) =>
      updateContractType(contractTypeId, request),
    onSuccess: invalidate,
  });
}

export function useUpdateContractTypeActive(contractTypeId: number) {
  const invalidate = useInvalidateContractTypes();

  return useMutation({
    mutationFn: (request: UpdateHrSettingActiveRequest) =>
      updateContractTypeActive(contractTypeId, request),
    onSuccess: invalidate,
  });
}
