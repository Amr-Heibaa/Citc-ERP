import { Award, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { HistoryEntry } from "@/lib/api/generated/model";

export function HistoryTab({ history }: { history: HistoryEntry[] }) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <div className="py-8 text-center font-['Inter',sans-serif] text-gray-400">
        {t("employees.historyTab.noHistory")}
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative">
        <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gray-100" />

        <div className="flex flex-col gap-0">
          {history.map((entry) => {
            const Icon = entry.current ? Award : Briefcase;
            const bg = entry.current ? "bg-emerald-100" : "bg-blue-100";
            const color = entry.current ? "text-emerald-500" : "text-blue-500";

            return (
              <div key={entry.employmentId} className="relative flex gap-4 pb-6">
                <div
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon size={14} className={color} />
                </div>

                <div className="flex-1 rounded-xl bg-[#f4f6f9] px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                        {entry.positionTitle ?? "—"}
                      </p>

                      <p className="mt-0.5 font-['Inter',sans-serif] text-xs text-gray-500">
                        {entry.orgUnitName ?? "—"}
                      </p>

                      {entry.reportingToName && (
                        <p className="mt-1.5 font-['Inter',sans-serif] text-xs text-gray-400">
                          {t("employees.fields.reportsToName", { name: entry.reportingToName })}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="whitespace-nowrap font-['Inter',sans-serif] text-xs text-gray-400">
                        {formatDate(entry.startDate)} →{" "}
                        {entry.endDate ? formatDate(entry.endDate) : t("employees.fields.present")}
                      </span>

                      {entry.current && (
                        <Badge className="border-0 bg-emerald-100 text-emerald-700">
                          {t("employees.fields.current")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
