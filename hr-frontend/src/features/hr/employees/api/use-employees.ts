import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUser, type CreateUserRequest } from "@/lib/api/auth";

import {
  confirmImport as confirmContractImport,
  previewImport as previewContractImport,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeDetail,
  restoreEmployee,
  updateEmployee,
  useGetEmployeeDetail,
  useGetMyEmployee,
  useListDeletedEmployees,
  useListEmployees,
} from "@/lib/api/generated/ems/employee-controller/employee-controller";

import {
  confirm1 as confirmEmployeeImport,
  preview1 as previewEmployeeImport,
} from "@/lib/api/generated/ems/employee-import-controller/employee-import-controller";

import { useListPositions } from "@/lib/api/generated/ems/job-position-controller/job-position-controller";

import {
  useContractTypes as useContractTypesQuery,
  useOrgUnits as useOrgUnitsQuery,
  useOrganizations as useOrganizationsQuery,
  useStatuses as useStatusesQuery,
} from "@/lib/api/generated/ems/reference-controller/reference-controller";

import type {
  CreateEmployeeRequest,
  DeleteEmployeeRequest,
  RestoreEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/lib/api/generated/model";

import { pageableParamsSerializer } from "@/lib/api/pageable";

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

// /api/hr/employees is now paginated server-side. Consumers throughout this
// app still expect "all employees" as a flat array (dropdowns, client-side
// filtering/reports), so request one large page and unwrap `.content` here
// rather than touching every call site.
const ALL_EMPLOYEES_PAGE_SIZE = 1000;
const ALL_POSITIONS_PAGE_SIZE = 1000;

export function useEmployees() {
  return useListEmployees(
    { pageable: { size: ALL_EMPLOYEES_PAGE_SIZE } },
    {
      query: { select: (page) => page.content ?? [] },
      request: { paramsSerializer: pageableParamsSerializer },
    },
  );
}

export function useMyEmployee() {
  return useGetMyEmployee({
    query: {
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status;
        // No linked employee record: retrying won't help.
        if (status === 404) return false;
        return failureCount < 2;
      },
    },
  });
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
  return useListPositions(
    { size: ALL_POSITIONS_PAGE_SIZE },
    {
      query: { staleTime: REFERENCE_STALE_TIME, select: (page) => page.content ?? [] },
    },
  );
}

export function useContractTypes() {
  return useContractTypesQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export type CreateEmployeeInput = {
  account?: CreateUserRequest;
  employee: CreateEmployeeRequest;
};

export type CreateEmployeeResult = {
  employeeId: number;
  accountCreated: boolean;
};

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, employee }: CreateEmployeeInput): Promise<CreateEmployeeResult> => {
      let userId = employee.userId;
      let accountCreated = false;

      if (account) {
        try {
          const createdUser = await createUser(account);

          userId = createdUser.userId;
          accountCreated = true;
        } catch {
          // The login-account provisioning endpoint is currently broken on
          // the auth service (unrelated to this app — tracked separately).
          // Don't let that block creating the employee record itself; the
          // employee is created without a linked login, and the caller
          // surfaces a warning so it isn't silent.
        }
      }

      const employeeId = await createEmployee({ ...employee, userId });

      return { employeeId, accountCreated };
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

export function useDeletedEmployees() {
  return useListDeletedEmployees();
}

export function useDeleteEmployee(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteEmployeeRequest) => deleteEmployee(employeeId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isEmployeeQueryKey(query.queryKey),
      });
    },
  });
}

export function useRestoreEmployee(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RestoreEmployeeRequest) => restoreEmployee(employeeId, data),

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
