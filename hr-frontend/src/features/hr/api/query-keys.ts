import { getGetEmployeeDetailQueryKey } from "@/lib/api/generated/ems/employee-controller/employee-controller";

const EMPLOYEE_PREFIX = "/api/hr/employees";
const REFERENCE_PREFIX = "/api/hr/ref";

export const employeeDetailQueryKey = getGetEmployeeDetailQueryKey;

export function isEmployeeQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(EMPLOYEE_PREFIX);
}

export function isReferenceQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(REFERENCE_PREFIX);
}
