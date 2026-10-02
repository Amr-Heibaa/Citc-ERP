import type { ReactNode } from "react";

export function SecurityPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-[#1a2535]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
