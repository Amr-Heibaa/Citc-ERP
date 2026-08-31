import { useListEmployees } from "@/lib/api/generated/ems/employee-controller/employee-controller";
import { useListContractTypes } from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

export function useEmployeesForReport() {
  return useListEmployees();
}

export function useContractTypesForReport() {
  return useListContractTypes({ size: 500 });
}
