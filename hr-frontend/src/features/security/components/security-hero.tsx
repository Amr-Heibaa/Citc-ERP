import type { ReactNode } from "react";

import { initials } from "@/features/hr/shared/utils/format";

/** Dark detail-page hero, matching the existing HR detail heroes. */
export function SecurityHero({
  title,
  subtitle,
  badgeText,
  badges,
  actions,
  square = false,
}: {
  title: string;
  subtitle?: ReactNode;
  /** Text used for the initials avatar. */
  badgeText: string;
  badges?: ReactNode;
  actions?: ReactNode;
  /** Square tile instead of a round avatar (roles, modules). */
  square?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)" }}
    >
      <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:flex rtl:left-8 rtl:right-auto">
        <div className="size-20 rounded-full bg-[#f5841f]/20" />
        <div className="-ml-10 size-20 rounded-full bg-[#2ecc71]/20" />
      </div>

      <div className="relative flex min-h-[104px] flex-wrap items-center gap-4 px-5 py-4">
        <div
          aria-hidden="true"
          className={`flex size-14 shrink-0 items-center justify-center bg-[#f5841f] font-['Space_Grotesk',sans-serif] text-lg font-bold text-white ${
            square ? "rounded-2xl" : "rounded-full"
          }`}
        >
          {initials(badgeText)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate font-['Space_Grotesk',sans-serif] text-2xl font-bold text-white">
              {title}
            </h1>
            {badges}
          </div>

          {subtitle && (
            <div className="mt-0.5 font-['Inter',sans-serif] text-xs text-[#a4aab6]">{subtitle}</div>
          )}
        </div>

        {actions && <div className="relative flex flex-wrap gap-2 lg:mr-44 rtl:lg:ml-44 rtl:lg:mr-0">{actions}</div>}
      </div>
    </div>
  );
}

/** Active/inactive pill styled for the dark hero background. */
export function HeroStatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-['Inter',sans-serif] text-xs font-medium ${
        active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/70"
      }`}
    >
      {label}
    </span>
  );
}

export function HeroTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-['Inter',sans-serif] text-xs font-medium text-white/80">
      {children}
    </span>
  );
}
