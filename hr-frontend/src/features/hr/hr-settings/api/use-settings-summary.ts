import {
  useGetSummary,
  useListHistory,
} from "@/lib/api/generated/ems/hr-settings-controller/hr-settings-controller";

export function useHrSettingsSummary() {
  return useGetSummary();
}

export function useHrSettingsHistory(
  domain?: string,
  settingId?: number,
  page = 0,
  size = 20,
) {
  return useListHistory({ domain, settingId, page, size });
}
