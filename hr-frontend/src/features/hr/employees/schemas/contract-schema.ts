import { z } from "zod";

import type { ContractDetail } from "@/lib/api/generated/model";

const optionalNumber = z
  .string()
  .regex(/^\d*(\.\d+)?$/, "Must be a valid number")
  .optional();

export const contractSchema = z.object({
  contractTypeId: z.string().min(1, "Contract type is required"),
  contractNumber: z.string().trim().min(1, "Contract number is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  salary: optionalNumber,
  salaryCurrency: z
    .string()
    .trim()
    .min(3, "Currency code must be at least 3 characters")
    .max(10, "Currency code must be at most 10 characters"),
  workingHoursPerWeek: optionalNumber,
  workingHoursPerMonth: optionalNumber,
  probationPeriodDays: optionalNumber,
  fulltime: z.boolean(),
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
  contractNumber: "",
  startDate: "",
  endDate: "",
  salary: "",
  salaryCurrency: "EGP",
  workingHoursPerWeek: "",
  workingHoursPerMonth: "",
  probationPeriodDays: "",
  fulltime: true,
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
    contractNumber: contract.contractNumber ?? "",
    startDate: contract.startDate ?? "",
    endDate: contract.endDate ?? "",
    salary: contract.salary != null ? String(contract.salary) : "",
    salaryCurrency: contract.salaryCurrency ?? "EGP",
    workingHoursPerWeek:
      contract.workingHoursPerWeek != null ? String(contract.workingHoursPerWeek) : "",
    workingHoursPerMonth:
      contract.workingHoursPerMonth != null ? String(contract.workingHoursPerMonth) : "",
    probationPeriodDays:
      contract.probationPeriodDays != null ? String(contract.probationPeriodDays) : "",
    fulltime: contract.fulltime ?? true,
    notes: contract.notes ?? "",
  };
}

export function toContractRequest(values: ContractFormValues) {
  return {
    contractTypeId: Number(values.contractTypeId),
    contractNumber: values.contractNumber.trim(),
    startDate: values.startDate,
    endDate: values.endDate?.trim() || undefined,
    salary: values.salary ? Number(values.salary) : undefined,
    salaryCurrency: values.salaryCurrency.trim(),
    workingHoursPerWeek: values.workingHoursPerWeek
      ? Number(values.workingHoursPerWeek)
      : undefined,
    workingHoursPerMonth: values.workingHoursPerMonth
      ? Number(values.workingHoursPerMonth)
      : undefined,
    probationPeriodDays: values.probationPeriodDays
      ? Number(values.probationPeriodDays)
      : undefined,
    fulltime: values.fulltime,
    notes: values.notes?.trim() || undefined,
  };
}
