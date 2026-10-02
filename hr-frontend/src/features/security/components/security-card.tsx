import type { ReactNode } from "react";

/** White content card used by detail tabs and overview sections. */
export function SecurityCard({
  title,
  action,
  children,
  flush = false,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Remove body padding (for tables). */
  flush?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5">
          {title && (
            <h2 className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">{title}</h2>
          )}
          {action}
        </div>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}
