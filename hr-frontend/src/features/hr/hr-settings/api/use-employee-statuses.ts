import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createEmployeeStatus,
  updateEmployeeStatus,
  updateEmployeeStatusActive,
  useGetEmployeeStatus,
  useListEmployeeStatuses,
} from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

import type {
  EmployeeStatusSettingRequest,
  UpdateHrSettingActiveRequest,
} from "@/lib/api/generated/model";

import { isHrSettingsQueryKey } from "@/features/hr/hr-settings/api/query-keys";

export function useEmployeeStatuses(
  search?: string,
  active?: boolean,
  page = 0,
  size = 20,
) {
  return useListEmployeeStatuses({ search, active, page, size });
}

export function useEmployeeStatusDetail(employeeStatusId: number) {
  return useGetEmployeeStatus(employeeStatusId, {
    query: { enabled: Number.isInteger(employeeStatusId) && employeeStatusId > 0 },
  });
}

function useInvalidateEmployeeStatuses() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => isHrSettingsQueryKey(query.queryKey),
    });
}

export function useCreateEmployeeStatus() {
  const invalidate = useInvalidateEmployeeStatuses();

  return useMutation({
    mutationFn: (request: EmployeeStatusSettingRequest) =>
      createEmployeeStatus(request),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployeeStatus(employeeStatusId: number) {
  const invalidate = useInvalidateEmployeeStatuses();

  return useMutation({
    mutationFn: (request: EmployeeStatusSettingRequest) =>
      updateEmployeeStatus(employeeStatusId, request),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployeeStatusActive(employeeStatusId: number) {
  const invalidate = useInvalidateEmployeeStatuses();

  return useMutation({
    mutationFn: (request: UpdateHrSettingActiveRequest) =>
      updateEmployeeStatusActive(employeeStatusId, request),
    onSuccess: invalidate,
  });
}
