import { z } from "zod";

import type { ContractTypeSetting } from "@/lib/api/generated/model";

export const contractTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(50, "Code must not exceed 50 characters")
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use letters, numbers, _ or -"),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  active: z.boolean(),
});

export type ContractTypeFormValues = z.infer<typeof contractTypeSchema>;

const EMPTY_DEFAULTS: ContractTypeFormValues = {
  code: "",
  name: "",
  description: "",
  active: true,
};

export function contractTypeToFormValues(
  contractType?: ContractTypeSetting,
): ContractTypeFormValues {
  if (!contractType) {
    return EMPTY_DEFAULTS;
  }

  return {
    code: contractType.code ?? "",
    name: contractType.name ?? "",
    description: contractType.description ?? "",
    active: contractType.active ?? true,
  };
}

export function toContractTypeRequest(values: ContractTypeFormValues) {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    active: values.active,
  };
}
