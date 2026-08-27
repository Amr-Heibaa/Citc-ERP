import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  changeAssignment,
  reactivate,
  terminate,
  updateStatus2 as updateEmploymentStatus,
  useGetHistory,
  useGetOverview,
  useGetTimeline,
} from "@/lib/api/generated/ems/employment-controller/employment-controller";

import { useListPositions } from "@/lib/api/generated/ems/job-position-controller/job-position-controller";

import type {
  ChangeEmploymentAssignmentRequest,
  ReactivateEmploymentRequest,
  TerminateEmploymentRequest,
  UpdateEmploymentStatusRequest,
} from "@/lib/api/generated/model";

import {
  employeeDetailQueryKey,
  employmentHistoryQueryKey,
  employmentOverviewQueryKey,
  employmentTimelineQueryKey,
  isEmploymentQueryKey,
} from "@/features/hr/employees/api/query-keys";

function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function useEmploymentOverview(employeeId: number) {
  return useGetOverview(employeeId, {
    query: { enabled: isValidId(employeeId) },
  });
}

export function useEmploymentHistory(employeeId: number, page = 0, size = 20) {
  return useGetHistory(
    employeeId,
    { page, size },
    { query: { enabled: isValidId(employeeId) } },
  );
}

export function useEmploymentTimeline(employeeId: number, page = 0, size = 20) {
  return useGetTimeline(
    employeeId,
    { page, size },
    { query: { enabled: isValidId(employeeId) } },
  );
}

export function usePositionsForEmployment(organizationId?: number) {
  return useListPositions(
    { organizationId, active: true, size: 100 },
    { query: { enabled: isValidId(organizationId ?? 0) } },
  );
}

function useInvalidateEmploymentAndEmployee(employeeId: number) {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        predicate: (query) => isEmploymentQueryKey(query.queryKey),
      }),
      queryClient.invalidateQueries({
        queryKey: employeeDetailQueryKey(employeeId),
      }),
      queryClient.invalidateQueries({
        queryKey: employmentOverviewQueryKey(employeeId),
      }),
      queryClient.invalidateQueries({
        queryKey: employmentHistoryQueryKey(employeeId),
      }),
      queryClient.invalidateQueries({
        queryKey: employmentTimelineQueryKey(employeeId),
      }),
    ]);
  };
}

export function useUpdateEmploymentStatus(employeeId: number) {
  const invalidate = useInvalidateEmploymentAndEmployee(employeeId);

  return useMutation({
    mutationFn: (request: UpdateEmploymentStatusRequest) =>
      updateEmploymentStatus(employeeId, request),

    onSuccess: invalidate,
  });
}

export function useTerminateEmployment(employeeId: number) {
  const invalidate = useInvalidateEmploymentAndEmployee(employeeId);

  return useMutation({
    mutationFn: (request: TerminateEmploymentRequest) =>
      terminate(employeeId, request),

    onSuccess: invalidate,
  });
}

export function useReactivateEmployment(employeeId: number) {
  const invalidate = useInvalidateEmploymentAndEmployee(employeeId);

  return useMutation({
    mutationFn: (request: ReactivateEmploymentRequest) =>
      reactivate(employeeId, request),

    onSuccess: invalidate,
  });
}

export function useChangeEmploymentAssignment(employeeId: number) {
  const invalidate = useInvalidateEmploymentAndEmployee(employeeId);

  return useMutation({
    mutationFn: (request: ChangeEmploymentAssignmentRequest) =>
      changeAssignment(employeeId, request),

    onSuccess: invalidate,
  });
}
