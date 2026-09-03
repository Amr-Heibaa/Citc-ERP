import { useTranslation } from "react-i18next";

export function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-['Inter',sans-serif] text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"
      }`}
    >
      {active ? t("common.active") : t("common.inactive")}
    </span>
  );
}
