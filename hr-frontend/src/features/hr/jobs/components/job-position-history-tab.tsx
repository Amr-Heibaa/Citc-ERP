import { useTranslation } from "react-i18next";

import { useJobPositionHistory } from "@/features/hr/jobs/api/use-job-positions";
import { SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";

export function JobPositionHistoryTab({
  positionId,
}: {
  positionId: number;
}) {
  const { t } = useTranslation();
  const history = useJobPositionHistory(positionId);
  const entries = history.data?.content ?? [];

  return (
    <section>
      <SectionTitle>{t("jobs.positionDetail.history.positionHistory")}</SectionTitle>

      {history.isLoading ? (
        <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
          {t("jobs.positionDetail.history.loading")}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex h-32 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
          {t("jobs.positionDetail.history.noHistory")}
        </div>
      ) : (
        <ol className="relative ml-2 border-l border-gray-100">
          {entries.map((entry) => (
            <li key={entry.eventId} className="mb-5 ml-5">
              <span className="absolute -left-1.5 mt-1 size-3 rounded-full bg-[#f5841f]" />

              <div className="flex flex-wrap items-center gap-2">
                <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                  {entry.eventType}
                </p>

                <span className="font-['Inter',sans-serif] text-xs text-gray-400">
                  {formatDate(entry.createdAt?.slice(0, 10))}
                </span>
              </div>

              <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-500">
                {entry.description}
              </p>

              <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                {t("jobs.positionDetail.history.by", {
                  name: entry.performedByName ?? t("jobs.positionDetail.history.systemFallback"),
                })}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
