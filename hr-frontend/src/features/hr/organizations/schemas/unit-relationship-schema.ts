import { z } from "zod";

export const unitRelationshipSchema =
  z
    .object({
      fromUnitId: z
        .string()
        .min(
          1,
          "From unit is required",
        ),

      toUnitId: z
        .string()
        .min(
          1,
          "To unit is required",
        ),

      relationTypeId: z
        .string()
        .min(
          1,
          "Relationship type is required",
        ),

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
        values.fromUnitId !==
        values.toUnitId,
      {
        message:
          "A unit cannot relate to itself",
        path: ["toUnitId"],
      },
    )
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

export type UnitRelationshipFormValues =
  z.infer<
    typeof unitRelationshipSchema
  >;