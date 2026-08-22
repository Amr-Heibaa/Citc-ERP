import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import type { OrganizationUnitDetail } from "@/lib/api/generated/model";

export function OrganizationUnitDetailHero({
  unit,
}: {
  unit: OrganizationUnitDetail;
}) {
  return (
    <div
      className="relative min-h-[104px] overflow-hidden rounded-xl"
      style={{
        background:
          "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
      }}
    >
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-16 border-r border-white/5 bg-white/[0.02]" />

      <div className="pointer-events-none absolute right-7 top-1/2 hidden -translate-y-1/2 sm:flex">
        <div className="size-16 rounded-full bg-[#f5841f]/20" />

        <div className="-ml-8 size-16 rounded-full bg-[#2ecc71]/20" />
      </div>

      <div className="relative flex min-h-[104px] items-center gap-5 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-['Inter',sans-serif] text-xl font-bold text-white">
            {unit.name ??
              "Organization Unit"}
          </h1>

          <p className="mt-1 truncate font-['Inter',sans-serif] text-xs text-[#a4aab6]">
            {unit.code ?? "—"}
          </p>
        </div>

        <OrganizationStatusBadge
          status={unit.status}
          className="mr-24 border-0 bg-emerald-500/20 text-emerald-300 sm:mr-32"
        />
      </div>
    </div>
  );
}