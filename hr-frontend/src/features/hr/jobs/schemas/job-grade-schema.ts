import { z } from "zod";

export const jobGradeSchema = z.object({
  code: z.string().trim().min(1, "Grade code is required").max(100),
  nameEn: z.string().trim().min(1, "English name is required").max(255),
  nameAr: z.string().trim().min(1, "Arabic name is required").max(255),
  rank: z.number().int("Rank must be a whole number"),
  active: z.boolean(),
});

export type JobGradeFormValues = z.infer<typeof jobGradeSchema>;
