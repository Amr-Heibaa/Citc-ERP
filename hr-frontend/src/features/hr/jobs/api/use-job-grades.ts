import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createGrade,
  updateGrade,
  updateStatus1 as updateGradeStatus,
  useGetGrade,
  useGetGradeHistory,
  useListGrades,
} from "@/lib/api/generated/ems/job-grade-controller/job-grade-controller";

import type {
  CreateJobGradeRequest,
  UpdateJobGradeRequest,
  UpdateJobGradeStatusRequest,
} from "@/lib/api/generated/model";

import {
  gradeDetailQueryKey,
  gradeListQueryKey,
} from "@/features/hr/jobs/api/query-keys";

function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function useJobGrades(active?: boolean) {
  return useListGrades({ active });
}

export function useJobGradeDetail(gradeId: number) {
  return useGetGrade(gradeId, {
    query: { enabled: isValidId(gradeId) },
  });
}

export function useJobGradeHistory(gradeId: number, page = 0, size = 20) {
  return useGetGradeHistory(
    gradeId,
    { page, size },
    { query: { enabled: isValidId(gradeId) } },
  );
}

export function useCreateJobGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateJobGradeRequest) => createGrade(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: gradeListQueryKey(),
      });
    },
  });
}

export function useUpdateJobGrade(gradeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateJobGradeRequest) =>
      updateGrade(gradeId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gradeListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: gradeDetailQueryKey(gradeId),
        }),
      ]);
    },
  });
}

export function useUpdateJobGradeStatus(gradeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateJobGradeStatusRequest) =>
      updateGradeStatus(gradeId, request),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gradeListQueryKey() }),
        queryClient.invalidateQueries({
          queryKey: gradeDetailQueryKey(gradeId),
        }),
      ]);
    },
  });
}
