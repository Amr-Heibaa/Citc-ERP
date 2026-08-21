import { z } from "zod";

import { parseEgyptianNationalId } from "@/features/hr/employees/utils/egyptian-national-id";

const optionalEmail = z
  .string()
  .email("Invalid email address")
  .optional()
  .or(z.literal(""));

const optionalNumber = z
  .string()
  .regex(/^\d*(\.\d+)?$/, "Must be a valid number")
  .optional();

export const identitySchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),

  email: z.string().trim().email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),

  otherName: z.string().optional(),

  displayName: z.string().optional(),

  gender: z.enum(["Male", "Female"], {
    message: "Gender is required",
  }),

  birthDate: z.string().optional(),

  nationalId: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;

      try {
        parseEgyptianNationalId(value);
        return true;
      } catch {
        return false;
      }
    }, "Invalid Egyptian national ID")
    .optional(),

  nationalIdExpiryDate: z.string().optional(),

  militaryExemptionExpiryDate: z.string().optional(),

  qualification: z
    .string()
    .max(255, "Qualification cannot exceed 255 characters")
    .optional(),

  socialInsuranceNumber: z.string().max(50).optional(),

  maritalStatus: z.string().max(50).optional(),

  graduationDate: z.string().optional(),

  specialization: z.string().max(255).optional(),

  workLocation: z.string().max(255).optional(),

  healthInsuranceCardNumber: z.string().max(100).optional(),

  totalExperienceYears: optionalNumber,

  leaveNotes: z.string().optional(),

  personalEmail: optionalEmail,
  businessEmail: optionalEmail,

  mobileNumber: z.string().optional(),

  phoneNumber: z.string().optional(),

  countryId: optionalNumber,
  stateId: optionalNumber,
  cityId: optionalNumber,

  addressLine1: z.string().optional(),

  addressLine2: z.string().optional(),

  postalCode: z.string().optional(),

  profilePhotoBase64: z.string().optional(),

  skills: z.string().optional(),
});

export const employmentSchema = z.object({
  employeeNumber: z.string().optional(),

  organizationId: z.string().optional(),

  currentOrgUnitId: z.string().optional(),

  employeeStatusId: z.string().optional(),

  hireDate: z.string().optional(),

  startDate: z.string().optional(),

  terminationDate: z.string().optional(),
});

export const positionSchema = z.object({
  positionId: z.string().optional(),

  positionOrgUnitId: z.string().optional(),

  assignmentType: z.string().optional(),

  positionStartDate: z.string().optional(),

  positionEndDate: z.string().optional(),

  reportingToEmployeeId: z.string().optional(),
});

export const contractSchema = z.object({
  contractTypeId: z.string().optional(),

  contractNumber: z.string().optional(),

  contractStartDate: z.string().optional(),

  contractEndDate: z.string().optional(),

  salary: optionalNumber,

  salaryCurrency: z.string().optional(),

  workingHoursPerWeek: optionalNumber,

  workingHoursPerMonth: optionalNumber,

  probationPeriodDays: optionalNumber,

  workType: z.enum(["Full Time", "Part Time"]).optional(),
  contractNotes: z.string().optional(),
});

// The edit dialog only ever updates the personal + employment fields that
// UpdateEmployeeRequest exposes (position/contract have their own flows).
// Unlike the create wizard's employment step, this field can't be skipped
// once an employee record exists.
export const editEmployeeSchema = personalInfoSchema.extend({
  ...employmentSchema.shape,
  employeeNumber: z.string().trim().min(1, "Employee number is required"),
});

export type IdentityFormValues = z.infer<typeof identitySchema>;

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export type EmploymentFormValues = z.infer<typeof employmentSchema>;

export type PositionFormValues = z.infer<typeof positionSchema>;

export type ContractFormValues = z.infer<typeof contractSchema>;

export type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

export type EmployeeWizardData = Partial<
  IdentityFormValues &
    PersonalInfoFormValues &
    EmploymentFormValues &
    PositionFormValues &
    ContractFormValues
>;
