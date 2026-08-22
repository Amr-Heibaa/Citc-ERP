import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import type { OrganizationDetail } from "@/lib/api/generated/model";

export function OrganizationDetailHero({
  organization,
}: {
  organization: OrganizationDetail;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
      }}
    >
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 sm:flex">
        <div className="size-20 rounded-full bg-[#f5841f]/20" />
        <div className="-ml-10 size-20 rounded-full bg-[#2ecc71]/20" />
      </div>

      <div className="relative flex min-h-[128px] flex-wrap items-center gap-5 px-6 py-5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5841f]">
          {organization.logoDataUrl ? (
            <img
              src={organization.logoDataUrl}
              alt={
                organization.nameEn ??
                "Organization logo"
              }
              className="size-full object-cover"
            />
          ) : (
            <span className="font-['Inter',sans-serif] text-base font-bold text-white">
              {organization.logoText ??
                organization.code ??
                "ORG"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-['Inter',sans-serif] text-2xl font-bold text-white">
            {organization.nameEn ??
              "Organization"}
          </p>

          {organization.nameAr && (
            <p
              dir="rtl"
              className="mt-0.5 truncate text-left font-['Inter',sans-serif] text-sm text-[#a4aab6]"
            >
              {organization.nameAr}
            </p>
          )}

          <p className="mt-1 font-['Inter',sans-serif] text-xs text-[#a4aab6]">
            Organization{" "}
            {organization.code ??
              "—"}
          </p>
        </div>

        <OrganizationStatusBadge
          status={
            organization.status
          }
          className="mr-28 border-0 bg-emerald-500/20 text-emerald-300 sm:mr-36"
        />
      </div>
    </div>
  );
}