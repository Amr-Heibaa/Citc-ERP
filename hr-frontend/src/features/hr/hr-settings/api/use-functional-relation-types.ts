import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createFunctionalRelationType,
  updateFunctionalRelationType,
  updateFunctionalRelationTypeActive,
  useGetFunctionalRelationType,
  useListFunctionalRelationTypes,
} from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

import type {
  FunctionalRelationTypeSettingRequest,
  UpdateHrSettingActiveRequest,
} from "@/lib/api/generated/model";

import { isHrSettingsQueryKey } from "@/features/hr/hr-settings/api/query-keys";

export function useFunctionalRelationTypes(
  search?: string,
  active?: boolean,
  page = 0,
  size = 20,
) {
  return useListFunctionalRelationTypes({ search, active, page, size });
}

export function useFunctionalRelationTypeDetail(functionalRelationTypeId: number) {
  return useGetFunctionalRelationType(functionalRelationTypeId, {
    query: {
      enabled: Number.isInteger(functionalRelationTypeId) && functionalRelationTypeId > 0,
    },
  });
}

function useInvalidateFunctionalRelationTypes() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => isHrSettingsQueryKey(query.queryKey),
    });
}

export function useCreateFunctionalRelationType() {
  const invalidate = useInvalidateFunctionalRelationTypes();

  return useMutation({
    mutationFn: (request: FunctionalRelationTypeSettingRequest) =>
      createFunctionalRelationType(request),
    onSuccess: invalidate,
  });
}

export function useUpdateFunctionalRelationType(functionalRelationTypeId: number) {
  const invalidate = useInvalidateFunctionalRelationTypes();

  return useMutation({
    mutationFn: (request: FunctionalRelationTypeSettingRequest) =>
      updateFunctionalRelationType(functionalRelationTypeId, request),
    onSuccess: invalidate,
  });
}

export function useUpdateFunctionalRelationTypeActive(
  functionalRelationTypeId: number,
) {
  const invalidate = useInvalidateFunctionalRelationTypes();

  return useMutation({
    mutationFn: (request: UpdateHrSettingActiveRequest) =>
      updateFunctionalRelationTypeActive(functionalRelationTypeId, request),
    onSuccess: invalidate,
  });
}
