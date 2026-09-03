import { z } from "zod";

export const assignEmployeeSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    assignmentType: z.string().min(1, "Assignment type is required"),
    primary: z.boolean(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
  })
  .refine((values) => !values.endDate || values.endDate >= values.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type AssignEmployeeFormValues = z.infer<typeof assignEmployeeSchema>;

// Labels are i18n key paths (not display text) — translate with t() at the call site.
export const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "1", label: "jobs.assignmentTypes.permanent" },
  { value: "2", label: "jobs.assignmentTypes.acting" },
  { value: "3", label: "jobs.assignmentTypes.temporary" },
];
