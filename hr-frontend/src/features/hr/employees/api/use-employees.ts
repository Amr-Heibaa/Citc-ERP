import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUser,
  resetUserPassword,
  type CreateUserRequest,
} from "@/lib/api/auth";

import {
  confirmImport as confirmContractImport,
  previewImport as previewContractImport,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeDetail,
  listEmployees,
  restoreEmployee,
  updateEmployee,
  useGetEmployeeDetail,
  useGetMyEmployee,
  useListDeletedEmployees,
} from "@/lib/api/generated/ems/employee-controller/employee-controller";

import {
  confirm1 as confirmEmployeeImport,
  preview1 as previewEmployeeImport,
} from "@/lib/api/generated/ems/employee-import-controller/employee-import-controller";

import { listPositions } from "@/lib/api/generated/ems/job-position-controller/job-position-controller";

import {
  useContractTypes as useContractTypesQuery,
  useOrgUnits as useOrgUnitsQuery,
  useOrganizations as useOrganizationsQuery,
  useStatuses as useStatusesQuery,
  useWorkLocations as useWorkLocationsQuery,
} from "@/lib/api/generated/ems/reference-controller/reference-controller";

import type {
  CreateEmployeeRequest,
  DeleteEmployeeRequest,
  RestoreEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/lib/api/generated/model";

import { fetchAllPages, pageableParamsSerializer } from "@/lib/api/pageable";

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

// /api/hr/employees is paginated server-side (capped at 100 per page).
// Consumers throughout this app still expect "all employees" as a flat
// array (dropdowns, client-side filtering/reports), so walk every page and
// concatenate here rather than touching every call site. Exported so other
// features (jobs, employment, reports, access-delegation) can reuse the
// same fetch instead of duplicating the paging loop.
export function useAllEmployees(staleTime = REFERENCE_STALE_TIME) {
  return useQuery({
    queryKey: ["/api/hr/employees", "all"],
    queryFn: () =>
      fetchAllPages((page, size) =>
        listEmployees(
          { pageable: { page, size } },
          { paramsSerializer: pageableParamsSerializer },
        ),
      ),
    staleTime,
  });
}

export function useEmployees() {
  return useAllEmployees();
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
      Promise.all(
        employeeIds.map((employeeId) => getEmployeeDetail(employeeId)),
      ),
  });
}

export function useStatuses() {
  return useStatusesQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useWorkLocations() {
  return useWorkLocationsQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useOrgUnits() {
  return useOrgUnitsQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function useOrganizations() {
  return useOrganizationsQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export function usePositions() {
  return useQuery({
    queryKey: ["/api/hr/jobs/positions", "all"],
    queryFn: () => fetchAllPages((page, size) => listPositions({ page, size })),
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useContractTypes() {
  return useContractTypesQuery({ query: { staleTime: REFERENCE_STALE_TIME } });
}

export type CreateEmployeeInput = {
  account: CreateUserRequest;
  employee: CreateEmployeeRequest;
};

export type CreateEmployeeResult = {
  employeeId: number;
  accountCreated: boolean;
};

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      account,
      employee,
    }: CreateEmployeeInput): Promise<CreateEmployeeResult> => {
      // Employee number must be explicitly entered.
      // Do not allow the backend to generate a fallback/random number.
      // const employeeNumber = employee.employeeNumber?.trim();

      // if (!employeeNumber) {
      //   throw new Error("Employee number is required");
      // }

      // if (!/^CITC-\d+$/.test(employeeNumber)) {
      //   throw new Error("Employee number must be in the format CITC-123");
      // }

      if (!account.username?.trim()) {
        throw new Error("Username is required");
      }

      if (!account.email?.trim()) {
        throw new Error("Email is required");
      }

      if (!account.password) {
        throw new Error("Password is required");
      }

      // IMPORTANT:
      // If account creation fails, the mutation stops here.
      // Employee will NOT be created without a login account.
      const createdUser = await createUser({
        username: account.username.trim(),
        email: account.email.trim(),
        password: account.password,
      });

      if (!createdUser?.userId) {
        throw new Error(
          "Account was not created correctly: userId was not returned",
        );
      }

      // Create employee only after the login account was successfully created.
      const employeeId = await createEmployee({
        ...employee,
        // employeeNumber,
        userId: createdUser.userId,
      });

      return {
        employeeId,
        accountCreated: true,
      };
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
    mutationFn: (data: UpdateEmployeeRequest) =>
      updateEmployee(employeeId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isEmployeeQueryKey(query.queryKey),
      });
    },
  });
}

// Creates a login account for an employee who doesn't have one yet, then
// links it by re-saving the employee with the new userId. UpdateEmployeeRequest
// does not have a `userId` field on the backend yet - see backend notes
// handed to the team for the required ems-hr change.
export type LinkEmployeeAccountInput = {
  account: CreateUserRequest;
  employeePayload: UpdateEmployeeRequest;
};

export function useCreateEmployeeAccount(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, employeePayload }: LinkEmployeeAccountInput) => {
      const createdUser = await createUser(account);

      if (!createdUser?.userId) {
        throw new Error(
          "Account was not created correctly: userId was not returned",
        );
      }

      await updateEmployee(employeeId, {
        ...employeePayload,
        userId: createdUser.userId,
      });

      return createdUser;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => isEmployeeQueryKey(query.queryKey),
      });
    },
  });
}

export function useResetEmployeePassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      resetUserPassword(userId, { newPassword }),
  });
}

export function useDeletedEmployees() {
  return useListDeletedEmployees();
}

export function useDeleteEmployee(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteEmployeeRequest) =>
      deleteEmployee(employeeId, data),

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
    mutationFn: (data: RestoreEmployeeRequest) =>
      restoreEmployee(employeeId, data),

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
      previewEmployeeImport(
        { file },
        { timeout: 120_000 },
      ) as unknown as Promise<EmployeeImportPreview>,
  });
}

export function useConfirmEmployeeImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      confirmEmployeeImport(
        { file },
        { timeout: 300_000 },
      ) as unknown as Promise<EmployeeImportResult>,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          isEmployeeQueryKey(query.queryKey) ||
          isReferenceQueryKey(query.queryKey),
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
      confirmContractImport(
        employeeId,
        { file },
        { timeout: 300_000 },
      ) as unknown as Promise<ContractImportResult>,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: employeeDetailQueryKey(employeeId),
      });
    },
  });
}
