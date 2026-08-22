import { z } from "zod";

export const ROOT_UNIT_VALUE =
  "__root-unit__";

export const organizationUnitSchema =
  z
    .object({
      code: z
        .string()
        .trim()
        .min(
          1,
          "Unit code is required",
        )
        .max(50),

      nameEn: z
        .string()
        .trim()
        .min(
          1,
          "English name is required",
        )
        .max(255),

      nameAr: z
        .string()
        .trim()
        .min(
          1,
          "Arabic name is required",
        )
        .max(255),

      unitTypeId: z
        .string()
        .min(
          1,
          "Unit type is required",
        ),

      parentOrgUnitId:
        z.string(),

      description: z
        .string()
        .max(2000)
        .optional(),

      descriptionAr: z
        .string()
        .max(2000)
        .optional(),

      startDate: z
        .string()
        .min(
          1,
          "Start date is required",
        ),

      endDate: z
        .string()
        .optional(),

      active: z.boolean(),
    })
    .refine(
      (values) =>
        !values.endDate ||
        values.endDate >=
          values.startDate,
      {
        message:
          "End date cannot be before start date",
        path: ["endDate"],
      },
    );

export type OrganizationUnitFormValues =
  z.infer<
    typeof organizationUnitSchema
  >;