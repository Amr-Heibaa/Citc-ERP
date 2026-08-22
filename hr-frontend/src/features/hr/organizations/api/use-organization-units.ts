import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createChildUnit,
  createUnit,
  updateUnit,
  useGetOrganizationTree,
  useGetUnitDetail,
  useListChildUnits,
  useListOrganizationUnits,
} from "@/lib/api/generated/ems/organization-unit-controller/organization-unit-controller";

import {
  createRelationship,
  removeRelationship,
  updateRelationship,
  useEmployees as useUnitEmployeesQuery,
  useHistory as useUnitHistoryQuery,
  usePositions as useUnitPositionsQuery,
  useRelationships as useUnitRelationshipsQuery,
} from "@/lib/api/generated/ems/organization-unit-tabs-controller/organization-unit-tabs-controller";

import {
  useRelationTypes as useRelationTypesQuery,
  useUnitTypes as useUnitTypesQuery,
} from "@/lib/api/generated/ems/organization-reference-controller/organization-reference-controller";

import type {
  CreateOrganizationUnitRequest,
  CreateUnitRelationshipRequest,
  UpdateOrganizationUnitRequest,
  UpdateUnitRelationshipRequest,
} from "@/lib/api/generated/model";

import {
  organizationDetailQueryKey,
  organizationListQueryKey,
  organizationTreeQueryKey,
  organizationUnitChildrenQueryKey,
  organizationUnitDetailQueryKey,
  organizationUnitHistoryQueryKey,
  organizationUnitRelationshipsQueryKey,
  organizationUnitsQueryKey,
} from "@/features/hr/organizations/api/query-keys";

const REFERENCE_STALE_TIME = 5 * 60 * 1000;

function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function useOrganizationTree(organizationId: number) {
  return useGetOrganizationTree(organizationId, {
    query: {
      enabled: isValidId(organizationId),
    },
  });
}

export function useOrganizationUnits(organizationId: number, enabled = true) {
  return useListOrganizationUnits(organizationId, {
    query: {
      enabled: enabled && isValidId(organizationId),
    },
  });
}

export function useOrganizationUnitDetail(orgUnitId: number) {
  return useGetUnitDetail(orgUnitId, {
    query: {
      enabled: isValidId(orgUnitId),
    },
  });
}

export function useOrganizationUnitTypes(enabled = true) {
  return useUnitTypesQuery({
    query: {
      enabled,
      staleTime: REFERENCE_STALE_TIME,
    },
  });
}

export function useOrganizationRelationTypes() {
  return useRelationTypesQuery({
    query: {
      staleTime: REFERENCE_STALE_TIME,
    },
  });
}

export function useOrganizationUnitEmployees(orgUnitId: number) {
  return useUnitEmployeesQuery(orgUnitId, {
    query: {
      enabled: isValidId(orgUnitId),
    },
  });
}

export function useOrganizationUnitPositions(orgUnitId: number) {
  return useUnitPositionsQuery(orgUnitId, {
    query: {
      enabled: isValidId(orgUnitId),
    },
  });
}

export function useOrganizationUnitChildUnits(orgUnitId: number) {
  return useListChildUnits(orgUnitId, {
    query: {
      enabled: isValidId(orgUnitId),
    },
  });
}

export function useOrganizationUnitRelationships(orgUnitId: number) {
  return useUnitRelationshipsQuery(orgUnitId, {
    query: {
      enabled: isValidId(orgUnitId),
    },
  });
}

export function useOrganizationUnitHistory(orgUnitId: number) {
  return useUnitHistoryQuery(orgUnitId, {
    query: {
      enabled: isValidId(orgUnitId),
    },
  });
}

export function useCreateOrganizationUnit(organizationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrganizationUnitRequest) =>
      createUnit(organizationId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationListQueryKey(),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationDetailQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationTreeQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitsQueryKey(organizationId),
        }),
      ]);
    },
  });
}

export function useCreateOrganizationChildUnit(
  organizationId: number,
  parentOrgUnitId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrganizationUnitRequest) =>
      createChildUnit(parentOrgUnitId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationListQueryKey(),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationDetailQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationTreeQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitsQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitDetailQueryKey(parentOrgUnitId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitChildrenQueryKey(parentOrgUnitId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitHistoryQueryKey(parentOrgUnitId),
        }),
      ]);
    },
  });
}

export function useUpdateOrganizationUnit(
  organizationId: number,
  orgUnitId: number,
  previousParentOrgUnitId?: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateOrganizationUnitRequest) =>
      updateUnit(orgUnitId, request),

    onSuccess: async (_response, request) => {
      const affectedParentIds = Array.from(
        new Set(
          [previousParentOrgUnitId, request.parentOrgUnitId].filter(
            (parentId): parentId is number =>
              parentId != null && isValidId(parentId),
          ),
        ),
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationListQueryKey(),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationDetailQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationTreeQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitsQueryKey(organizationId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitDetailQueryKey(orgUnitId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitHistoryQueryKey(orgUnitId),
        }),

        ...affectedParentIds.map((parentOrgUnitId) =>
          queryClient.invalidateQueries({
            queryKey: organizationUnitChildrenQueryKey(parentOrgUnitId),
          }),
        ),

        ...affectedParentIds.map((parentOrgUnitId) =>
          queryClient.invalidateQueries({
            queryKey: organizationUnitDetailQueryKey(parentOrgUnitId),
          }),
        ),
      ]);
    },
  });
}
export function useCreateOrganizationUnitRelationship(orgUnitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUnitRelationshipRequest) =>
      createRelationship(orgUnitId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationUnitRelationshipsQueryKey(orgUnitId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitHistoryQueryKey(orgUnitId),
        }),
      ]);
    },
  });
}

export function useUpdateOrganizationUnitRelationship(
  orgUnitId: number,
  relationId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateUnitRelationshipRequest) =>
      updateRelationship(orgUnitId, relationId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationUnitRelationshipsQueryKey(orgUnitId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitHistoryQueryKey(orgUnitId),
        }),
      ]);
    },
  });
}

export function useRemoveOrganizationUnitRelationship(orgUnitId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationId: number) =>
      removeRelationship(orgUnitId, relationId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationUnitRelationshipsQueryKey(orgUnitId),
        }),

        queryClient.invalidateQueries({
          queryKey: organizationUnitHistoryQueryKey(orgUnitId),
        }),
      ]);
    },
  });
}
