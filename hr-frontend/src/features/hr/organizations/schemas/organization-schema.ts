import { z } from "zod";

export const organizationSchema = z.object({
  code: z.string().max(100).optional(),

  nameEn: z.string().trim().min(1, "English name is required").max(255),
  nameAr: z.string().trim().min(1, "Arabic name is required").max(255),

  organizationTypeId: z.string().min(1, "Organization type is required"),

  active: z.boolean(),

  establishedDate: z.string().min(1, "Established date is required"),

  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required")
    .max(255),

  taxNumber: z.string().trim().min(1, "Tax number is required").max(255),

  phone: z.string().trim().min(1, "Phone is required").max(255),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255),

  fax: z.string().max(255).optional(),
  website: z.string().max(1000).optional(),

  countryId: z.string().min(1, "Country is required"),
  stateId: z.string().min(1, "State is required"),
  cityId: z.string().min(1, "City is required"),

  addressLine1: z.string().trim().min(1, "Address is required").max(255),
  addressLine2: z.string().max(255).optional(),
  postalCode: z.string().max(20).optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
