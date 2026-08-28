import { z } from "zod";

import type { EmployeeStatusSetting } from "@/lib/api/generated/model";

export const employeeStatusSchema = z.object({
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
    .max(255, "Description must not exceed 255 characters")
    .optional(),

  active: z.boolean(),
});

export type EmployeeStatusFormValues = z.infer<typeof employeeStatusSchema>;

const EMPTY_DEFAULTS: EmployeeStatusFormValues = {
  code: "",
  nameEn: "",
  nameAr: "",
  description: "",
  active: true,
};

export function employeeStatusToFormValues(
  status?: EmployeeStatusSetting,
): EmployeeStatusFormValues {
  if (!status) {
    return EMPTY_DEFAULTS;
  }

  return {
    code: status.code ?? "",
    nameEn: status.nameEn ?? "",
    nameAr: status.nameAr ?? "",
    description: status.description ?? "",
    active: status.active ?? true,
  };
}

export function toEmployeeStatusRequest(values: EmployeeStatusFormValues) {
  return {
    code: values.code.trim(),
    nameEn: values.nameEn.trim(),
    nameAr: values.nameAr?.trim() || undefined,
    description: values.description?.trim() || undefined,
    active: values.active,
  };
}
