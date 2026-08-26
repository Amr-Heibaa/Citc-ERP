import { JobStatusBadge } from "@/features/hr/jobs/components/job-status-badge";
import type { JobPositionDetail } from "@/lib/api/generated/model";

export function JobPositionDetailHero({
  position,
}: {
  position: JobPositionDetail;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
      }}
    >
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 sm:flex">
        <div className="size-20 rounded-full bg-[#f5841f]/20" />
        <div className="-ml-10 size-20 rounded-full bg-[#2ecc71]/20" />
      </div>

      <div className="relative flex min-h-[104px] flex-wrap items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="truncate font-['Inter',sans-serif] text-2xl font-bold text-white">
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
