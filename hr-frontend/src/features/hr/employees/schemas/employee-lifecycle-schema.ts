import { z } from "zod";

import type {
  DeleteEmployeeRequest,
  RestoreEmployeeRequest,
} from "@/lib/api/generated/model";

export const reasonSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
});

export type ReasonFormValues = z.infer<typeof reasonSchema>;

export function toDeleteEmployeeRequest(
  values: ReasonFormValues,
): DeleteEmployeeRequest {
  return { reason: values.reason };
}

export function toRestoreEmployeeRequest(
  values: ReasonFormValues,
): RestoreEmployeeRequest {
  return { reason: values.reason };
}
