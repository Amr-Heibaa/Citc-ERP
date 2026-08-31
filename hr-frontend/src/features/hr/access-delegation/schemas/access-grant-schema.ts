import { z } from "zod";

import type { GrantHrAccessRequest } from "@/lib/api/generated/model";

export const grantAccessSchema = z.object({
  userId: z.string().min(1, "Select an employee"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
});

export type GrantAccessFormValues = z.infer<typeof grantAccessSchema>;

export function toGrantAccessRequest(
  values: GrantAccessFormValues,
): GrantHrAccessRequest {
  return {
    userId: Number(values.userId),
    startDate: values.startDate,
    endDate: values.endDate || undefined,
    reason: values.reason,
  };
}
