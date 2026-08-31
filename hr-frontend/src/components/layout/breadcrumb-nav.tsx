import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import type { Crumb } from "@/components/layout/breadcrumbs";

export function BreadcrumbNav({ crumbs }: { crumbs: Crumb[] }) {
  const { t } = useTranslation();

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center">
      <ol className="flex min-w-0 items-center">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && (
                <span className="mx-1.5 shrink-0 font-['Inter',sans-serif] text-[15px] text-[#9ca3af] md:text-[18px]">
                  ›
                </span>
              )}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className="truncate font-['Inter',sans-serif] text-[15px] font-bold text-[#6b7280] transition-colors hover:text-[#f5841f] md:text-[18px]"
                >
                  {t(crumb.label)}
                </Link>
              ) : (
                <span className="truncate font-['Inter',sans-serif] text-[15px] font-bold text-[#1a2535] md:text-[18px]">
                  {t(crumb.label)}
                </span>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
