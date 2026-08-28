import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUser, type CreateUserRequest } from "@/lib/api/auth";

import {
  confirmImport as confirmContractImport,
  previewImport as previewContractImport,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";

import {
  createEmployee,
  getEmployeeDetail,
  updateEmployee,
  useGetEmployeeDetail,
  useGetMyEmployee,
  useListEmployees,
} from "@/lib/api/generated/ems/employee-controller/employee-controller";

import {
  confirm1 as confirmEmployeeImport,
  preview1 as previewEmployeeImport,
} from "@/lib/api/generated/ems/employee-import-controller/employee-import-controller";

import {
  useContractTypes as useContractTypesQuery,
  useOrgUnits as useOrgUnitsQuery,
  useOrganizations as useOrganizationsQuery,
  usePositions1 as usePositionsQuery,
  useStatuses as useStatusesQuery,
} from "@/lib/api/generated/ems/reference-controller/reference-controller";

import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/lib/api/generated/model";

import {
  employeeDetailQueryKey,
  isEmployeeQueryKey,
  isReferenceQueryKey,
} from "@/features/hr/employees/api/query-keys";

// See employee-import-types.ts: the generated types for these two
// endpoints are wrong (backend schema-naming bug), so we cast to the
// real runtime shape here instead of hand-writing the whole request.
import type {
  ContractImportResult,
  EmployeeImportPreview,
  EmployeeImportResult,
} from "@/features/hr/employees/api/import-row-types";

const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export function useEmployees() {
  return useListEmployees();
}

export function useMyEmployee() {
  return useGetMyEmployee({ query: { retry: false } });
}

export function useEmployeeDetail(employeeId: number) {
  return useGetEmployeeDetail(employeeId, {
    query: { enabled: Number.isInteger(employeeId) && employeeId > 0 },
  });
}

export function useFetchEmployeeDetails() {
  return useMutation({
    mutationFn: (employeeIds: number[]) =>
      Promise.all(employeeIds.map((employeeId) => getEmployeeDetail(employeeId))),
  });
}

export function useStatuses() {
  return useStatusesQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useOrgUnits() {
  return useOrgUnitsQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useOrganizations() {
  return useOrganizationsQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function usePositions() {
  return usePositionsQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useContractTypes() {
  return useContractTypesQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export type CreateEmployeeInput = {
  account?: CreateUserRequest;
  employee: CreateEmployeeRequest;
};

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, employee }: CreateEmployeeInput) => {
      let userId = employee.userId;

      if (account) {
        const createdUser = await createUser(account);

        userId = createdUser.userId;
      }

      return createEmployee({ ...employee, userId });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isEmployeeQueryKey(query.queryKey),
      });
    },
  });
}

export function useUpdateEmployee(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => updateEmployee(employeeId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isEmployeeQueryKey(query.queryKey),
      });
    },
  });
}

export function usePreviewEmployeeImport() {
  return useMutation({
    mutationFn: (file: File) =>
      previewEmployeeImport({ file }, { timeout: 120_000 }) as unknown as Promise<EmployeeImportPreview>,
  });
}

export function useConfirmEmployeeImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      confirmEmployeeImport({ file }, { timeout: 300_000 }) as unknown as Promise<EmployeeImportResult>,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          isEmployeeQueryKey(query.queryKey) || isReferenceQueryKey(query.queryKey),
      });
    },
  });
}

export function usePreviewContractImport(employeeId: number) {
  return useMutation({
    mutationFn: (file: File) =>
      previewContractImport(employeeId, { file }, { timeout: 120_000 }),
  });
}

export function useConfirmContractImport(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      confirmContractImport(employeeId, { file }, { timeout: 300_000 }) as unknown as Promise<ContractImportResult>,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: employeeDetailQueryKey(employeeId),
      });
    },
  });
}
