import { z } from "zod";

import type { FunctionalRelationTypeSetting } from "@/lib/api/generated/model";

export const functionalRelationTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(50, "Code must not exceed 50 characters")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
      "Use letters, numbers, _ or -",
    ),

  nameEn: z
    .string()
    .trim()
    .min(1, "Name (English) is required")
    .max(100, "Name (English) must not exceed 100 characters"),

  nameAr: z
    .string()
    .max(100, "Name (Arabic) must not exceed 100 characters")
    .optional(),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  approvalRelation: z.boolean(),
  active: z.boolean(),
});

export type FunctionalRelationTypeFormValues = z.infer<
  typeof functionalRelationTypeSchema
>;

const EMPTY_DEFAULTS: FunctionalRelationTypeFormValues = {
  code: "",
  nameEn: "",
  nameAr: "",
  description: "",
  approvalRelation: false,
  active: true,
};

export function functionalRelationTypeToFormValues(
  type?: FunctionalRelationTypeSetting,
): FunctionalRelationTypeFormValues {
  if (!type) {
    return EMPTY_DEFAULTS;
  }

  return {
    code: type.code ?? "",
    nameEn: type.nameEn ?? "",
    nameAr: type.nameAr ?? "",
    description: type.description ?? "",
    approvalRelation: type.approvalRelation ?? false,
    active: type.active ?? true,
  };
}

export function toFunctionalRelationTypeRequest(
  values: FunctionalRelationTypeFormValues,
) {
  return {
    code: values.code.trim(),
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr?.trim() || undefined,
    description: values.description?.trim() || undefined,
    approvalRelation: values.approvalRelation,
    active: values.active,
  };
}
