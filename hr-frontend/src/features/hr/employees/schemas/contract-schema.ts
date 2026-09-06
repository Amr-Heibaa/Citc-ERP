import { z } from "zod";

import type { ContractDetail, CreateContractRequest } from "@/lib/api/generated/model";

const optionalNumber = z
  .string()
  .regex(/^\d*(\.\d+)?$/, "Must be a valid number")
  .optional();

export const contractSchema = z.object({
  contractTypeId: z.string().min(1, "Contract type is required"),
  contractTemplateId: z.string().min(1, "Contract template is required"),
  contractNumber: z.string().trim().min(1, "Contract number is required"),
  contractDate: z.string().min(1, "Contract date is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  salaryBasis: z.enum(["MONTHLY", "HOURLY"]),
  salary: optionalNumber,
  salaryCurrency: z
    .string()
    .trim()
    .min(3, "Currency code must be at least 3 characters")
    .max(10, "Currency code must be at most 10 characters"),
  hourlyRate: optionalNumber,
  maxMonthlyHours: optionalNumber,
  workingHoursPerWeek: optionalNumber,
  workingHoursPerMonth: optionalNumber,
  probationPeriodDays: optionalNumber,
  noticePeriodDays: optionalNumber,
  fulltime: z.boolean(),
  projectName: z.string().optional(),
  externalEmployerName: z.string().optional(),
  externalLeaveStartDate: z.string().optional(),
  externalLeaveEndDate: z.string().optional(),
  notes: z.string().optional(),
});

export type ContractFormValues = z.infer<typeof contractSchema>;

export const endContractSchema = z.object({
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

export type EndContractFormValues = z.infer<typeof endContractSchema>;

const EMPTY_CONTRACT_DEFAULTS: ContractFormValues = {
  contractTypeId: "",
  contractTemplateId: "",
  contractNumber: "",
  contractDate: "",
  startDate: "",
  endDate: "",
  salaryBasis: "MONTHLY",
  salary: "",
  salaryCurrency: "EGP",
  hourlyRate: "",
  maxMonthlyHours: "",
  workingHoursPerWeek: "",
  workingHoursPerMonth: "",
  probationPeriodDays: "",
  noticePeriodDays: "",
  fulltime: true,
  projectName: "",
  externalEmployerName: "",
  externalLeaveStartDate: "",
  externalLeaveEndDate: "",
  notes: "",
};

export function contractToFormValues(
  contract?: ContractDetail,
): ContractFormValues {
  if (!contract) {
    return EMPTY_CONTRACT_DEFAULTS;
  }

  return {
    contractTypeId: contract.contractTypeId != null ? String(contract.contractTypeId) : "",
    contractTemplateId:
      contract.contractTemplateId != null ? String(contract.contractTemplateId) : "",
    contractNumber: contract.contractNumber ?? "",
    contractDate: contract.contractDate ?? "",
    startDate: contract.startDate ?? "",
    endDate: contract.endDate ?? "",
    salaryBasis: contract.salaryBasis ?? "MONTHLY",
    salary: contract.salary != null ? String(contract.salary) : "",
    salaryCurrency: contract.salaryCurrency ?? "EGP",
    hourlyRate: contract.hourlyRate != null ? String(contract.hourlyRate) : "",
    maxMonthlyHours:
      contract.maxMonthlyHours != null ? String(contract.maxMonthlyHours) : "",
    workingHoursPerWeek:
      contract.workingHoursPerWeek != null ? String(contract.workingHoursPerWeek) : "",
    workingHoursPerMonth:
      contract.workingHoursPerMonth != null ? String(contract.workingHoursPerMonth) : "",
    probationPeriodDays:
      contract.probationPeriodDays != null ? String(contract.probationPeriodDays) : "",
    noticePeriodDays:
      contract.noticePeriodDays != null ? String(contract.noticePeriodDays) : "",
    fulltime: contract.fulltime ?? true,
    projectName: contract.projectName ?? "",
    externalEmployerName: contract.externalEmployerName ?? "",
    externalLeaveStartDate: contract.externalLeaveStartDate ?? "",
    externalLeaveEndDate: contract.externalLeaveEndDate ?? "",
    notes: contract.notes ?? "",
  };
}

export function createContractRequestToFormValues(
  request?: CreateContractRequest,
): ContractFormValues {
  if (!request) {
    return EMPTY_CONTRACT_DEFAULTS;
  }

  return {
    contractTypeId: request.contractTypeId != null ? String(request.contractTypeId) : "",
    contractTemplateId:
      request.contractTemplateId != null ? String(request.contractTemplateId) : "",
    contractNumber: request.contractNumber ?? "",
    contractDate: request.contractDate ?? "",
    startDate: request.startDate ?? "",
    endDate: request.endDate ?? "",
    salaryBasis: request.salaryBasis ?? "MONTHLY",
    salary: request.salary != null ? String(request.salary) : "",
    salaryCurrency: request.salaryCurrency ?? "EGP",
    hourlyRate: request.hourlyRate != null ? String(request.hourlyRate) : "",
    maxMonthlyHours: request.maxMonthlyHours != null ? String(request.maxMonthlyHours) : "",
    workingHoursPerWeek:
      request.workingHoursPerWeek != null ? String(request.workingHoursPerWeek) : "",
    workingHoursPerMonth:
      request.workingHoursPerMonth != null ? String(request.workingHoursPerMonth) : "",
    probationPeriodDays:
      request.probationPeriodDays != null ? String(request.probationPeriodDays) : "",
    noticePeriodDays:
      request.noticePeriodDays != null ? String(request.noticePeriodDays) : "",
    fulltime: request.fulltime ?? true,
    projectName: request.projectName ?? "",
    externalEmployerName: request.externalEmployerName ?? "",
    externalLeaveStartDate: request.externalLeaveStartDate ?? "",
    externalLeaveEndDate: request.externalLeaveEndDate ?? "",
    notes: request.notes ?? "",
  };
}

export function toContractRequest(values: ContractFormValues) {
  return {
    contractTypeId: Number(values.contractTypeId),
    contractTemplateId: Number(values.contractTemplateId),
    contractNumber: values.contractNumber.trim(),
    contractDate: values.contractDate,
    startDate: values.startDate,
    endDate: values.endDate?.trim() || undefined,
    salaryBasis: values.salaryBasis,
    salary: values.salary ? Number(values.salary) : undefined,
    salaryCurrency: values.salaryCurrency.trim(),
    hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : undefined,
    maxMonthlyHours: values.maxMonthlyHours ? Number(values.maxMonthlyHours) : undefined,
    workingHoursPerWeek: values.workingHoursPerWeek
      ? Number(values.workingHoursPerWeek)
      : undefined,
    workingHoursPerMonth: values.workingHoursPerMonth
      ? Number(values.workingHoursPerMonth)
      : undefined,
    probationPeriodDays: values.probationPeriodDays
      ? Number(values.probationPeriodDays)
      : undefined,
    noticePeriodDays: values.noticePeriodDays ? Number(values.noticePeriodDays) : undefined,
    fulltime: values.fulltime,
    projectName: values.projectName?.trim() || undefined,
    externalEmployerName: values.externalEmployerName?.trim() || undefined,
    externalLeaveStartDate: values.externalLeaveStartDate?.trim() || undefined,
    externalLeaveEndDate: values.externalLeaveEndDate?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
  };
}
