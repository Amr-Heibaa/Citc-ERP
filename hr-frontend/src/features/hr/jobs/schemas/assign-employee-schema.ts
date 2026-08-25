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

export const ASSIGNMENT_TYPE_OPTIONS = [
  { value: "1", label: "Permanent" },
  { value: "2", label: "Acting" },
  { value: "3", label: "Temporary" },
];
