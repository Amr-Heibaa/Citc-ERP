import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

type PageItem = number | "gap";

/** First, last, and a window around the current page (all zero-based). */
function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);

  const items: PageItem[] = [0];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages - 2, page + 1);

  if (start > 1) items.push("gap");
  for (let index = start; index <= end; index += 1) items.push(index);
  if (end < totalPages - 2) items.push("gap");
  items.push(totalPages - 1);

  return items;
}

/** Server-driven pagination footer (backend page index is zero-based). */
export function SecurityPagination({
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  disabled = false,
}: {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  if (totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min(totalElements, (page + 1) * size);

  return (
    <nav
      aria-label={t("security.pagination.label")}
      className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 font-['Inter',sans-serif] text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{t("security.pagination.showing", { from, to, total: totalElements })}</span>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled || page <= 0}
            onClick={() => onPageChange(page - 1)}
            aria-label={t("security.pagination.previous")}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>

          {pageItems(page, totalPages).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={t("security.pagination.goTo", { page: item + 1 })}
                className={`size-8 cursor-pointer rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5841f]/50 disabled:cursor-not-allowed ${
                  item === page ? "bg-[#1a2535] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item + 1}
              </button>
            ),
          )}

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled || page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t("security.pagination.next")}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </nav>
  );
}
