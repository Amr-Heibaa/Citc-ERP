import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createSkill,
  updateSkill,
  updateSkillActive,
  useGetSkill,
  useListSkills,
} from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

import type {
  SkillSettingRequest,
  UpdateHrSettingActiveRequest,
} from "@/lib/api/generated/model";

import { isHrSettingsQueryKey } from "@/features/hr/hr-settings/api/query-keys";

export function useSkills(search?: string, active?: boolean, page = 0, size = 20) {
  return useListSkills({ search, active, page, size });
}

export function useSkillDetail(skillId: number) {
  return useGetSkill(skillId, {
    query: { enabled: Number.isInteger(skillId) && skillId > 0 },
  });
}

function useInvalidateSkills() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => isHrSettingsQueryKey(query.queryKey),
    });
}

export function useCreateSkill() {
  const invalidate = useInvalidateSkills();

  return useMutation({
    mutationFn: (request: SkillSettingRequest) => createSkill(request),
    onSuccess: invalidate,
  });
}

export function useUpdateSkill(skillId: number) {
  const invalidate = useInvalidateSkills();

  return useMutation({
    mutationFn: (request: SkillSettingRequest) => updateSkill(skillId, request),
    onSuccess: invalidate,
  });
}

export function useUpdateSkillActive(skillId: number) {
  const invalidate = useInvalidateSkills();

  return useMutation({
    mutationFn: (request: UpdateHrSettingActiveRequest) =>
      updateSkillActive(skillId, request),
    onSuccess: invalidate,
  });
}
