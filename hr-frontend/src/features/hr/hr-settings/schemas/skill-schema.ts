import { z } from "zod";

import type { SkillSetting } from "@/lib/api/generated/model";

export const skillSchema = z.object({
  nameEn: z.string().trim().min(1, "Name (English) is required"),
  nameAr: z.string().optional(),
  active: z.boolean(),
});

export type SkillFormValues = z.infer<typeof skillSchema>;

const EMPTY_DEFAULTS: SkillFormValues = {
  nameEn: "",
  nameAr: "",
  active: true,
};

export function skillToFormValues(skill?: SkillSetting): SkillFormValues {
  if (!skill) {
    return EMPTY_DEFAULTS;
  }

  return {
    nameEn: skill.nameEn ?? "",
    nameAr: skill.nameAr ?? "",
    active: skill.active ?? true,
  };
}

export function toSkillRequest(values: SkillFormValues) {
  return {
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr?.trim() || undefined,
    active: values.active,
  };
}
