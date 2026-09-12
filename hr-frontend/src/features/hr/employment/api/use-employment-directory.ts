import { useAllEmployees } from "@/features/hr/employees/api/use-employees";

export function useEmploymentDirectory() {
  return useAllEmployees();
}
