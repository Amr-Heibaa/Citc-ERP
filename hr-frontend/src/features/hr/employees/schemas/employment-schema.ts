import { z } from "zod";

export const TERMINAL_STATUS_CODES = [
  "TERMINATED",
  "RESIGNED",
  "RETIRED",
  "CONTRACT_END",
  "INACTIVE",
];

export const REACTIVATION_STATUS_CODES = ["ACTIVE", "PROBATION"];

// Labels are i18n key paths (not display text) — translate with t() at the call site.
export const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "1", label: "jobs.assignmentTypes.permanent" },
  { value: "2", label: "jobs.assignmentTypes.acting" },
  { value: "3", label: "jobs.assignmentTypes.temporary" },
];

export const updateStatusSchema = z.object({
  employeeStatusId: z.string().min(1, "Status is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  reason: z.string().optional(),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

export const terminateSchema = z.object({
  employeeStatusId: z.string().min(1, "Status is required"),
  terminationDate: z.string().min(1, "Termination date is required"),
  reason: z.string().optional(),
});

export type TerminateFormValues = z.infer<typeof terminateSchema>;

export const reactivateSchema = z.object({
  // Client-side only, used to scope the position picker — not sent to the backend.
  organizationId: z.string().optional(),
  employeeStatusId: z.string().min(1, "Status is required"),
  positionId: z.string().min(1, "Position is required"),
  assignmentType: z.string().min(1, "Assignment type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});

export type ReactivateFormValues = z.infer<typeof reactivateSchema>;

export const assignmentChangeSchema = z.object({
  positionId: z.string().min(1, "Position is required"),
  assignmentType: z.string().min(1, "Assignment type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});

export type AssignmentChangeFormValues = z.infer<typeof assignmentChangeSchema>;

export function toUpdateStatusRequest(values: UpdateStatusFormValues) {
  return {
    employeeStatusId: Number(values.employeeStatusId),
    effectiveDate: values.effectiveDate,
    reason: values.reason?.trim() || undefined,
  };
}

export function toTerminateRequest(values: TerminateFormValues) {
  return {
    employeeStatusId: Number(values.employeeStatusId),
    terminationDate: values.terminationDate,
    reason: values.reason?.trim() || undefined,
  };
}

export function toReactivateRequest(values: ReactivateFormValues) {
  return {
    employeeStatusId: Number(values.employeeStatusId),
    positionId: Number(values.positionId),
    assignmentType: Number(values.assignmentType),
    startDate: values.startDate,
    endDate: values.endDate?.trim() || undefined,
    reason: values.reason?.trim() || undefined,
  };
}

export function toAssignmentChangeRequest(values: AssignmentChangeFormValues) {
  return {
    positionId: Number(values.positionId),
    assignmentType: Number(values.assignmentType),
    startDate: values.startDate,
    endDate: values.endDate?.trim() || undefined,
    reason: values.reason?.trim() || undefined,
  };
}
