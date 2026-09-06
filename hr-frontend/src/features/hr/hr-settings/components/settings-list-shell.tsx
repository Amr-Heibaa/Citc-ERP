import { Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_STATUSES = "__all__";
const ACTIVE_ONLY = "__active__";
const INACTIVE_ONLY = "__inactive__";

export function SettingsListShell({
  title,
  subtitle,
  backLabel,
  backTo,
  search,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  addLabel,
  onAdd,
  page,
  totalPages,
  totalElements,
  onPageChange,
  children,
}: {
  title: string;
  subtitle: string;
  backLabel: string;
  backTo: string;
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter?: boolean;
  onActiveFilterChange: (value: boolean | undefined) => void;
  addLabel: string;
  onAdd: () => void;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filterValue =
    activeFilter === undefined
      ? ALL_STATUSES
      : activeFilter
        ? ACTIVE_ONLY
        : INACTIVE_ONLY;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
          >
            ← {backLabel}
          </button>

          <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
            {title}
          </h1>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
            {subtitle}
          </p>
        </div>

        <Button onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2.5">
          <Search size={16} className="shrink-0 text-gray-400" />

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("hrSettings.list.searchPlaceholder")}
            className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter',sans-serif] text-sm text-gray-600 shadow-none outline-none placeholder:text-gray-400 focus-visible:ring-0"
          />
        </div>

        <Select
          value={filterValue}
          onValueChange={(value) => {
            if (value === ACTIVE_ONLY) {
              onActiveFilterChange(true);
            } else if (value === INACTIVE_ONLY) {
              onActiveFilterChange(false);
            } else {
              onActiveFilterChange(undefined);
            }
          }}
        >
          <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-40">
            <SelectValue placeholder={t("hrSettings.list.allStatus")} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL_STATUSES}>{t("hrSettings.list.allStatus")}</SelectItem>
            <SelectItem value={ACTIVE_ONLY}>{t("hrSettings.list.active")}</SelectItem>
            <SelectItem value={INACTIVE_ONLY}>{t("hrSettings.list.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {children}
      </div>

      {totalElements > 0 && (
        <div className="flex items-center justify-between font-['Inter',sans-serif] text-xs text-gray-400">
          <span>
            {t("hrSettings.list.pageOf", {
              page: page + 1,
              totalPages: Math.max(totalPages, 1),
              total: totalElements,
            })}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
            >
              {t("hrSettings.list.previous")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("hrSettings.list.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
