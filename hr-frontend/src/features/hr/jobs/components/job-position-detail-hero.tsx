import { JobStatusBadge } from "@/features/hr/jobs/components/job-status-badge";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function JobPositionDetailHero({
  position,
}: {
  position: JobPositionDetail;
}) {
  const initials = position.code?.split("-")[0] ?? "JP";

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
      }}
    >
      <div className="flex min-h-[104px] items-center gap-4 px-5 py-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#f5841f]/20">
          <span className="font-['Inter',sans-serif] text-lg font-bold text-white">
            {initials}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="truncate font-['Inter',sans-serif] text-lg font-bold text-white">
              {position.titleEn}
            </p>

            <JobStatusBadge
              active={position.active ?? false}
              className="border-0 bg-emerald-500/20 text-emerald-300"
            />

            {position.occupancyStatus && (
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-['Inter',sans-serif] text-xs font-medium text-white/80">
                {position.occupancyStatus}
              </span>
            )}
          </div>

          <p className="mt-0.5 font-['Inter',sans-serif] text-xs text-[#a4aab6]">
            {position.code} · {position.orgUnitName}
          </p>
        </div>
      </div>
    </div>
  );
}
