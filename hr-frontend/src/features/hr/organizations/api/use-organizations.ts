import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createOrganization,
  updateOrganization,
  updateOrganizationLogo,
  useGetOrganizationDetail,
  useListOrganizations,
} from "@/lib/api/generated/ems/organization-controller/organization-controller";

import {
  useCities as useCitiesQuery,
  useCountries as useCountriesQuery,
  useOrganizationTypes as useOrganizationTypesQuery,
  useStates as useStatesQuery,
} from "@/lib/api/generated/ems/organization-reference-controller/organization-reference-controller";

import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from "@/lib/api/generated/model";

import { isOrganizationQueryKey } from "@/features/hr/organizations/api/query-keys";

const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export function useOrganizations() {
  return useListOrganizations();
}

export function useOrganizationDetail(organizationId: number) {
  return useGetOrganizationDetail(organizationId, {
    query: { enabled: Number.isInteger(organizationId) && organizationId > 0 },
  });
}

export function useOrganizationTypes() {
  return useOrganizationTypesQuery({
    query: { staleTime: REFERENCE_STALE_TIME },
  });
}

export function useCountries() {
  return useCountriesQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useStatesByCountry(countryId: number | undefined) {
  return useStatesQuery(
    { countryId: countryId ?? 0 },
    {
      query: {
        enabled: countryId != null,
        staleTime: REFERENCE_STALE_TIME,
      },
    },
  );
}

export function useCitiesByState(stateId: number | undefined) {
  return useCitiesQuery(
    { stateId: stateId ?? 0 },
    {
      query: {
        enabled: stateId != null,
        staleTime: REFERENCE_STALE_TIME,
      },
    },
  );
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => createOrganization(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isOrganizationQueryKey(query.queryKey),
      });
    },
  });
}

export function useUpdateOrganization(organizationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) =>
      updateOrganization(organizationId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isOrganizationQueryKey(query.queryKey),
      });
    },
  });
}

export function useUpdateOrganizationLogo(organizationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      updateOrganizationLogo(organizationId, { file }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isOrganizationQueryKey(query.queryKey),
      });
    },
  });
}
