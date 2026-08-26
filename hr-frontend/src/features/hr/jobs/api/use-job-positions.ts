import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assignEmployee,
  createPosition,
  endAssignment,
  updatePosition,
  updateStatus as updatePositionStatus,
  useGetHierarchy,
  useGetPosition,
  useGetPositionHistory,
  useGetStatistics,
  useListAssignments,
  useListPositions,
} from "@/lib/api/generated/ems/job-position-controller/job-position-controller";

import { useListOrganizations } from "@/lib/api/generated/ems/organization-controller/organization-controller";
import {
  useGetUnitDetail,
  useListOrganizationUnits,
} from "@/lib/api/generated/ems/organization-unit-controller/organization-unit-controller";
import {
  useGetEmployeeDetail,
  useListEmployees,
} from "@/lib/api/generated/ems/employee-controller/employee-controller";

import type {
  AssignEmployeeToPositionRequest,
  CreateJobPositionRequest,
  EndPositionAssignmentRequest,
  GetHierarchyParams,
  GetStatisticsParams,
  ListPositionsParams,
  UpdateJobPositionRequest,
  UpdateJobPositionStatusRequest,
} from "@/lib/api/generated/model";

import {
  positionAssignmentsQueryKey,
  positionDetailQueryKey,
  positionHierarchyQueryKey,
  positionHistoryQueryKey,
  positionListQueryKey,
  positionStatisticsQueryKey,
} from "@/features/hr/jobs/api/query-keys";

const REFERENCE_STALE_TIME = 5 * 60 * 1000;

function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function useJobPositions(params: ListPositionsParams) {
  return useListPositions(params);
}

export function useJobPositionDetail(positionId: number) {
  return useGetPosition(positionId, {
    query: { enabled: isValidId(positionId) },
  });
}

export function useJobPositionHistory(positionId: number, page = 0, size = 20) {
  return useGetPositionHistory(
    positionId,
    { page, size },
    { query: { enabled: isValidId(positionId) } },
  );
}

export function useJobPositionAssignments(
  positionId: number,
  page = 0,
  size = 20,
) {
  return useListAssignments(
    positionId,
    { page, size },
    { query: { enabled: isValidId(positionId) } },
  );
}

export function useJobPositionStatistics(params: GetStatisticsParams = {}) {
  return useGetStatistics(params);
}

export function useJobPositionHierarchy(params: GetHierarchyParams = {}) {
  return useGetHierarchy(params);
}

export function useJobPositionsForOrganization(organizationId?: number) {
  return useListPositions(
    { organizationId, size: 100 },
    { query: { enabled: isValidId(organizationId ?? 0) } },
  );
}

export function useOrganizationsForJobs() {
  return useListOrganizations({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useOrgUnitsForJobs(organizationId?: number) {
  return useListOrganizationUnits(organizationId ?? 0, {
    query: {
      enabled: isValidId(organizationId ?? 0),
      staleTime: REFERENCE_STALE_TIME,
    },
  });
}

export function useEmployeesForJobs() {
  return useListEmployees({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useEmployeeNameLookup(): Record<number, string> {
  const employees = useEmployeesForJobs();

  const lookup: Record<number, string> = {};

  for (const employee of employees.data ?? []) {
    if (employee.employeeId != null && employee.displayName) {
      lookup[employee.employeeId] = employee.displayName;
    }
  }

  return lookup;
}

export function useOrgUnitDetailForJobs(orgUnitId?: number) {
  return useGetUnitDetail(orgUnitId ?? 0, {
    query: { enabled: isValidId(orgUnitId ?? 0) },
  });
}

export function useAssignedEmployeeDetail(employeeId?: number) {
  return useGetEmployeeDetail(employeeId ?? 0, {
    query: { enabled: isValidId(employeeId ?? 0) },
  });
}

export function useCreateJobPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateJobPositionRequest) => createPosition(request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: positionListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: positionStatisticsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHierarchyQueryKey(),
        }),
      ]);
    },
  });
}

export function useUpdateJobPosition(positionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateJobPositionRequest) =>
      updatePosition(positionId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: positionListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: positionDetailQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHistoryQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHierarchyQueryKey(),
        }),
      ]);
    },
  });
}

export function useUpdateJobPositionStatus(positionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateJobPositionStatusRequest) =>
      updatePositionStatus(positionId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: positionListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: positionDetailQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHistoryQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionStatisticsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHierarchyQueryKey(),
        }),
      ]);
    },
  });
}

export function useAssignEmployeeToPosition(positionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignEmployeeToPositionRequest) =>
      assignEmployee(positionId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: positionListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: positionDetailQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionAssignmentsQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHistoryQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionStatisticsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHierarchyQueryKey(),
        }),
      ]);
    },
  });
}

export function useEndJobPositionAssignment(
  positionId: number,
  assignmentId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EndPositionAssignmentRequest) =>
      endAssignment(positionId, assignmentId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: positionListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: positionDetailQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionAssignmentsQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHistoryQueryKey(positionId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionStatisticsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: positionHierarchyQueryKey(),
        }),
      ]);
    },
  });
}
