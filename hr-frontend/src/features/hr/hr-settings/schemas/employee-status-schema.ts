import { z } from "zod";

import type { EmployeeStatusSetting } from "@/lib/api/generated/model";

export const employeeStatusSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use letters, numbers, _ or -"),
  nameEn: z.string().trim().min(1, "Name (English) is required"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
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
