import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createUser, type CreateUserRequest } from "@/lib/api/auth";

import {
  createEmployee,
  getEmployeeDetail,
  getMyEmployee,
  listContractTypes,
  listEmployees,
  listOrganizations,
  listOrgUnits,
  listPositions,
  listStatuses,
  updateEmployee,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  confirmEmployeeImport,
  previewEmployeeImport,
  confirmContractImport,
  previewContractImport,
} from "@/lib/api/hr-api";

export const employeeKeys = {
  all: ["employees"] as const,

  lists: () => [...employeeKeys.all, "list"] as const,

  detail: (employeeId: number) =>
    [...employeeKeys.all, "detail", employeeId] as const,

  me: () => [...employeeKeys.all, "me"] as const,
};

export const hrReferenceKeys = {
  all: ["hr-reference-data"] as const,

  statuses: () => [...hrReferenceKeys.all, "statuses"] as const,

  orgUnits: () => [...hrReferenceKeys.all, "org-units"] as const,

  organizations: () => [...hrReferenceKeys.all, "organizations"] as const,

  positions: () => [...hrReferenceKeys.all, "positions"] as const,

  contractTypes: () => [...hrReferenceKeys.all, "contract-types"] as const,
};

const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: listEmployees,
  });
}

export function useMyEmployee() {
  return useQuery({
    queryKey: employeeKeys.me(),
    queryFn: getMyEmployee,
    retry: false,
  });
}

export function useEmployeeDetail(employeeId: number) {
  return useQuery({
    queryKey: employeeKeys.detail(employeeId),

    queryFn: () => getEmployeeDetail(employeeId),

    enabled: Number.isInteger(employeeId) && employeeId > 0,
  });
}

export function useStatuses() {
  return useQuery({
    queryKey: hrReferenceKeys.statuses(),

    queryFn: listStatuses,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useOrgUnits() {
  return useQuery({
    queryKey: hrReferenceKeys.orgUnits(),

    queryFn: listOrgUnits,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: hrReferenceKeys.organizations(),

    queryFn: listOrganizations,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function usePositions() {
  return useQuery({
    queryKey: hrReferenceKeys.positions(),

    queryFn: listPositions,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useContractTypes() {
  return useQuery({
    queryKey: hrReferenceKeys.contractTypes(),

    queryFn: listContractTypes,
    staleTime: REFERENCE_STALE_TIME,
  });
}

export type CreateEmployeeInput = {
  account?: CreateUserRequest;
  employee: CreateEmployeeRequest;
};

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, employee }: CreateEmployeeInput) => {
      let userId = employee.userId ?? null;

      if (account) {
        const createdUser = await createUser(account);

        userId = createdUser.userId;
      }

      return createEmployee({
        ...employee,
        userId,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: employeeKeys.all,
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
        queryKey: employeeKeys.all,
      });
    },
  });
}

export function usePreviewEmployeeImport() {
  return useMutation({
    mutationFn: (file: File) => previewEmployeeImport(file),
  });
}

export function useConfirmEmployeeImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => confirmEmployeeImport(file),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: employeeKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: hrReferenceKeys.all,
        }),
      ]);
    },
  });
}
export function usePreviewContractImport(employeeId: number) {
  return useMutation({
    mutationFn: (file: File) => previewContractImport(employeeId, file),
  });
}

export function useConfirmContractImport(employeeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => confirmContractImport(employeeId, file),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(employeeId),
      });
    },
  });
}
