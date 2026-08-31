import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";

export function JobStatusBadge({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <Badge
      className={`border-0 ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      } ${className ?? ""}`}
    >
      {active ? t("common.active") : t("common.inactive")}
    </Badge>
  );
}
