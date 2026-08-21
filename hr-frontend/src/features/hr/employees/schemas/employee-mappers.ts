import type {
  CreateEmployeeRequest,
  EmployeeDetail,
  UpdateEmployeeRequest,
} from "@/lib/api/generated/model";

import type {
  EditEmployeeFormValues,
  EmployeeWizardData,
} from "@/features/hr/employees/schemas/employee-schema";

import { readImageFile } from "@/features/hr/shared/utils/read-image-file";

export function numberOrNull(value?: string): number | null {
  return value ? Number(value) : null;
}

const GENDER_TO_API: Record<"Male" | "Female", number> = {
  Male: 1,
  Female: 2,
};

export function genderToApi(gender?: "Male" | "Female"): number {
  return gender === "Female" ? GENDER_TO_API.Female : GENDER_TO_API.Male;
}

export function genderFromApi(
  genderId: number | null | undefined,
): "Male" | "Female" | undefined {
  if (genderId == null) return undefined;

  return genderId === GENDER_TO_API.Female ? "Female" : "Male";
}

export function skillsToArray(skills?: string): string[] {
  return (skills ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function skillsToString(skills?: string[] | null): string {
  return (skills ?? []).join(", ");
}

export function fulltimeToWorkType(
  fulltime?: boolean | null,
): "Full Time" | "Part Time" | undefined {
  if (fulltime == null) return undefined;

  return fulltime ? "Full Time" : "Part Time";
}

export function workTypeToFulltime(
  workType?: "Full Time" | "Part Time",
): boolean | null {
  return workType ? workType === "Full Time" : null;
}

export async function readPhotoFile(
  file?: File,
): Promise<{ base64: string; dataUrl: string } | null> {
  return readImageFile(file);
}

export type CreateEmployeeInput = EmployeeWizardData;

export function toCreateEmployeeRequest(
  all: CreateEmployeeInput,
): CreateEmployeeRequest {
  return {
    employeeNumber: all.employeeNumber ?? "",

    firstName: all.firstName ?? "",

    otherName: all.otherName || undefined,

    displayName:
      all.displayName?.trim() ||
      [all.firstName, all.otherName].filter(Boolean).join(" "),

    gender: genderToApi(all.gender),

    birthDate: all.birthDate || undefined,

    nationalId: all.nationalId || undefined,
    nationalIdExpiryDate: all.nationalIdExpiryDate || undefined,

    militaryExemptionExpiryDate:
      all.gender === "Female"
        ? undefined
        : all.militaryExemptionExpiryDate || undefined,

    qualification: all.qualification?.trim() || undefined,

    socialInsuranceNumber: all.socialInsuranceNumber?.trim() || undefined,

    maritalStatus: all.maritalStatus?.trim() || undefined,

    graduationDate: all.graduationDate || undefined,

    specialization: all.specialization?.trim() || undefined,

    workLocation: all.workLocation?.trim() || undefined,

    healthInsuranceCardNumber: all.healthInsuranceCardNumber?.trim() || undefined,

    totalExperienceYears: numberOrNull(all.totalExperienceYears) ?? undefined,

    leaveNotes: all.leaveNotes?.trim() || undefined,

    personalEmail: all.personalEmail || all.email || undefined,

    businessEmail: all.businessEmail || undefined,

    phoneNumber: all.phoneNumber || undefined,

    mobileNumber: all.mobileNumber || undefined,

    countryId: numberOrNull(all.countryId) ?? undefined,

    stateId: numberOrNull(all.stateId) ?? undefined,

    cityId: numberOrNull(all.cityId) ?? undefined,

    addressLine1: all.addressLine1 || undefined,

    addressLine2: all.addressLine2 || undefined,

    postalCode: all.postalCode || undefined,

    profilePhotoBase64: all.profilePhotoBase64 || undefined,

    skills: skillsToArray(all.skills),

    currentOrgUnitId:
      numberOrNull(all.positionOrgUnitId || all.currentOrgUnitId) ?? undefined,

    employeeStatusId: numberOrNull(all.employeeStatusId) ?? undefined,

    hireDate: all.hireDate || undefined,

    startDate: all.startDate || undefined,

    positionId: numberOrNull(all.positionId) ?? undefined,

    assignmentType: numberOrNull(all.assignmentType) ?? undefined,

    positionStartDate: all.positionStartDate || undefined,

    positionEndDate: all.positionEndDate || undefined,

    reportingToEmployeeId: numberOrNull(all.reportingToEmployeeId) ?? undefined,

    contractTypeId: numberOrNull(all.contractTypeId) ?? undefined,

    contractNumber: all.contractNumber || undefined,

    contractStartDate: all.contractStartDate || undefined,

    contractEndDate: all.contractEndDate || undefined,

    salary: undefined,
    salaryCurrency: "EGP",

    workingHoursPerWeek: numberOrNull(all.workingHoursPerWeek) ?? undefined,

    workingHoursPerMonth: numberOrNull(all.workingHoursPerMonth) ?? undefined,

    probationPeriodDays: numberOrNull(all.probationPeriodDays) ?? undefined,

    fulltime: workTypeToFulltime(all.workType) ?? undefined,
    contractNotes: all.contractNotes?.trim() || undefined,
  };
}

export function toUpdateEmployeeRequest(
  values: EditEmployeeFormValues,
): UpdateEmployeeRequest {
  return {
    employeeNumber: values.employeeNumber.trim(),
    currentOrgUnitId: numberOrNull(values.currentOrgUnitId) ?? undefined,
    employeeStatusId: numberOrNull(values.employeeStatusId) ?? undefined,
    hireDate: values.hireDate || undefined,
    startDate: values.startDate || undefined,
    terminationDate: values.terminationDate || undefined,

    firstName: values.firstName.trim(),
    otherName: values.otherName || undefined,
    displayName: values.displayName || undefined,
    gender: genderToApi(values.gender),
    birthDate: values.birthDate || undefined,
    nationalId: values.nationalId || undefined,
    nationalIdExpiryDate: values.nationalIdExpiryDate || undefined,

    militaryExemptionExpiryDate:
      values.gender === "Female"
        ? undefined
        : values.militaryExemptionExpiryDate || undefined,

    qualification: values.qualification?.trim() || undefined,
    socialInsuranceNumber: values.socialInsuranceNumber?.trim() || undefined,

    maritalStatus: values.maritalStatus?.trim() || undefined,

    graduationDate: values.graduationDate || undefined,

    specialization: values.specialization?.trim() || undefined,

    workLocation: values.workLocation?.trim() || undefined,

    healthInsuranceCardNumber:
      values.healthInsuranceCardNumber?.trim() || undefined,

    totalExperienceYears: numberOrNull(values.totalExperienceYears) ?? undefined,

    leaveNotes: values.leaveNotes?.trim() || undefined,

    personalEmail: values.personalEmail || undefined,
    businessEmail: values.businessEmail || undefined,
    phoneNumber: values.phoneNumber || undefined,
    mobileNumber: values.mobileNumber || undefined,

    countryId: numberOrNull(values.countryId) ?? undefined,
    stateId: numberOrNull(values.stateId) ?? undefined,
    cityId: numberOrNull(values.cityId) ?? undefined,
    addressLine1: values.addressLine1 || undefined,
    addressLine2: values.addressLine2 || undefined,
    postalCode: values.postalCode || undefined,
    profilePhotoBase64: values.profilePhotoBase64 || undefined,
    skills: skillsToArray(values.skills),
  };
}

export function employeeDetailToEditFormValues(
  emp: EmployeeDetail,
): EditEmployeeFormValues {
  return {
    employeeNumber: emp.employeeNumber ?? "",
    currentOrgUnitId: emp.currentOrgUnitId?.toString() ?? "",
    employeeStatusId: emp.employeeStatusId?.toString() ?? "",
    hireDate: emp.hireDate ?? "",
    startDate: emp.startDate ?? "",
    terminationDate: emp.terminationDate ?? "",

    firstName: emp.firstName ?? "",
    otherName: emp.otherName ?? "",
    displayName: emp.displayName ?? "",
    gender: genderFromApi(emp.gender) ?? "Male",
    birthDate: emp.birthDate ?? "",
    nationalId: emp.nationalId ?? "",
    nationalIdExpiryDate: emp.nationalIdExpiryDate ?? "",

    militaryExemptionExpiryDate: emp.militaryExemptionExpiryDate ?? "",

    qualification: emp.qualification ?? "",

    socialInsuranceNumber: emp.socialInsuranceNumber ?? "",

    maritalStatus: emp.maritalStatus ?? "",

    graduationDate: emp.graduationDate ?? "",

    specialization: emp.specialization ?? "",

    workLocation: emp.workLocation ?? "",

    healthInsuranceCardNumber: emp.healthInsuranceCardNumber ?? "",

    totalExperienceYears: emp.totalExperienceYears?.toString() ?? "",

    leaveNotes: emp.leaveNotes ?? "",

    personalEmail: emp.personalEmail ?? "",
    businessEmail: emp.businessEmail ?? "",
    phoneNumber: emp.phoneNumber ?? "",
    mobileNumber: emp.mobileNumber ?? "",

    countryId: emp.countryId?.toString() ?? "",
    stateId: emp.stateId?.toString() ?? "",
    cityId: emp.cityId?.toString() ?? "",
    addressLine1: emp.addressLine1 ?? "",
    addressLine2: emp.addressLine2 ?? "",
    postalCode: emp.postalCode ?? "",
    profilePhotoBase64: "",
    skills: skillsToString(emp.skills),
  };
}
