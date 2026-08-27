import { getGetEmployeeDetailQueryKey } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import {
  getGetContractQueryKey,
  getListContractsQueryKey,
} from "@/lib/api/generated/ems/employee-contract-controller/employee-contract-controller";
import {
  getGetHistoryQueryKey,
  getGetOverviewQueryKey,
  getGetTimelineQueryKey,
} from "@/lib/api/generated/ems/employment-controller/employment-controller";

const EMPLOYEE_PREFIX = "/api/hr/employees";
const REFERENCE_PREFIX = "/api/hr/ref";
const EMPLOYMENT_PREFIX = "/api/hr/employment";

export const employeeDetailQueryKey = getGetEmployeeDetailQueryKey;
export const contractListQueryKey = getListContractsQueryKey;
export const contractDetailQueryKey = getGetContractQueryKey;
export const employmentOverviewQueryKey = getGetOverviewQueryKey;
export const employmentHistoryQueryKey = getGetHistoryQueryKey;
export const employmentTimelineQueryKey = getGetTimelineQueryKey;

export function isEmployeeQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(EMPLOYEE_PREFIX);
}

export function isEmploymentQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(EMPLOYMENT_PREFIX);
}

export function isReferenceQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(REFERENCE_PREFIX);
}
