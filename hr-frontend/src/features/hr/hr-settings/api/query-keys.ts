import {
  getGetContractTypeQueryKey,
  getGetEmployeeStatusQueryKey,
  getGetFunctionalRelationTypeQueryKey,
  getGetSkillQueryKey,
  getGetSummaryQueryKey,
  getListContractTypesQueryKey,
  getListEmployeeStatusesQueryKey,
  getListFunctionalRelationTypesQueryKey,
  getListHistoryQueryKey,
  getListSkillsQueryKey,
} from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

const SETTINGS_PREFIX = "/api/hr/settings";

export const skillListQueryKey = getListSkillsQueryKey;
export const skillDetailQueryKey = getGetSkillQueryKey;
export const employeeStatusListQueryKey = getListEmployeeStatusesQueryKey;
export const employeeStatusDetailQueryKey = getGetEmployeeStatusQueryKey;
export const contractTypeListQueryKey = getListContractTypesQueryKey;
export const contractTypeDetailQueryKey = getGetContractTypeQueryKey;
export const functionalRelationTypeListQueryKey =
  getListFunctionalRelationTypesQueryKey;
export const functionalRelationTypeDetailQueryKey =
  getGetFunctionalRelationTypeQueryKey;
export const settingsSummaryQueryKey = getGetSummaryQueryKey;
export const settingsHistoryQueryKey = getListHistoryQueryKey;

export function isHrSettingsQueryKey(queryKey: readonly unknown[]): boolean {
  const [first] = queryKey;

  return typeof first === "string" && first.startsWith(SETTINGS_PREFIX);
}
