import { z } from "zod";

export const jobPositionSchema = z.object({
  code: z
    .string()
    .trim()
    .max(100)
    .regex(/^$|^[A-Za-z0-9_-]+$/, "Only letters, numbers, - and _ are allowed")
    .optional(),
  titleEn: z.string().trim().min(1, "English title is required").max(255),
  titleAr: z.string().trim().min(1, "Arabic title is required").max(255),
  organizationId: z.string().min(1, "Organization is required"),
  orgUnitId: z.string().min(1, "Organization unit is required"),
  gradeId: z.string().optional(),
  positionLevel: z.number().int().min(1, "Position level must be at least 1"),
  reportsToPositionId: z.string().optional(),
  descriptionEn: z.string().max(5000).optional(),
  descriptionAr: z.string().max(5000).optional(),
  open: z.boolean(),
  active: z.boolean(),
});

export type JobPositionFormValues = z.infer<typeof jobPositionSchema>;
