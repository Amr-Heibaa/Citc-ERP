import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Lock,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/components/ui/utils";

export type TransferItem = {
  id: number;
  label: string;
  /** Secondary line, e.g. code or employee number. */
  description?: string | null;
  /** Small pill, e.g. "Inactive". */
  tag?: string | null;
  /** Locked items cannot be moved in either direction. */
  locked?: boolean;
  lockedReason?: string;
};

function matches(item: TransferItem, query: string) {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    item.label.toLowerCase().includes(needle) ||
    (item.description?.toLowerCase().includes(needle) ?? false)
  );
}

function TransferPanel({
  title,
  count,
  items,
  checked,
  onToggle,
  search,
  onSearchChange,
  searchPlaceholder,
  emptyText,
  disabled,
}: {
  title: string;
  count: number;
  items: TransferItem[];
  checked: Set<number>;
  onToggle: (id: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  emptyText: string;
  disabled: boolean;
}) {
  return (
    <section
      aria-label={title}
      className="flex h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white md:h-[380px]"
    >
      <div className="border-b border-gray-100 p-3">
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f4f6f9] px-3 py-2 focus-within:ring-2 focus-within:ring-[#f5841f]/30">
          <Search size={13} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent font-['Inter',sans-serif] text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </label>
      </div>

      <div className="border-b border-gray-100 bg-[#f8f9fb] px-4 py-2.5">
        <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
          {title} ({count})
        </h3>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <li className="px-4 py-10 text-center font-['Inter',sans-serif] text-sm text-gray-400">
            {emptyText}
          </li>
        ) : (
          items.map((item) => {
            const isChecked = checked.has(item.id);
            const inputId = `transfer-${title}-${item.id}`;

            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 border-b border-gray-50 px-4 py-2.5 transition-colors last:border-0",
                  isChecked ? "bg-[#f5841f]/8" : "hover:bg-gray-50",
                  item.locked && "bg-gray-50/60",
                )}
              >
                {item.locked ? (
                  <Lock className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
                ) : (
                  <Checkbox
                    id={inputId}
                    checked={isChecked}
                    disabled={disabled}
                    onCheckedChange={() => onToggle(item.id)}
                    className="data-[state=checked]:border-[#f5841f] data-[state=checked]:bg-[#f5841f]"
                  />
                )}

                <label
                  htmlFor={item.locked ? undefined : inputId}
                  className={cn("min-w-0 flex-1", !item.locked && !disabled && "cursor-pointer")}
                  title={item.locked ? item.lockedReason : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate font-['Inter',sans-serif] text-sm font-medium text-[#1a2535]">
                      {item.label}
                    </span>
                    {item.tag && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                        {item.tag}
                      </span>
                    )}
                  </span>
                  {(item.description || (item.locked && item.lockedReason)) && (
                    <span className="block truncate font-['Inter',sans-serif] text-xs text-gray-400">
                      {item.locked && item.lockedReason ? item.lockedReason : item.description}
                    </span>
                  )}
                </label>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  primary = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-11 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5841f]/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
        primary
          ? "bg-[#1a2535] text-white hover:bg-[#243347]"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Dual-list assignment editor (Figma "DualPanelTransfer"). Controlled by the
 * parent through value/onChange with numeric backend ids. Stacks vertically on
 * narrow screens.
 */
export function DualPanelTransfer({
  items,
  value,
  onChange,
  availableLabel,
  assignedLabel,
  searchPlaceholder,
  disabled = false,
}: {
  items: TransferItem[];
  value: number[];
  onChange: (ids: number[]) => void;
  availableLabel: string;
  assignedLabel: string;
  searchPlaceholder: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [leftChecked, setLeftChecked] = useState<Set<number>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<number>>(new Set());

  const assigned = useMemo(() => new Set(value), [value]);
  const available = items.filter((item) => !assigned.has(item.id));
  const selected = items.filter((item) => assigned.has(item.id));

  const visibleAvailable = available.filter((item) => matches(item, leftSearch));
  const visibleSelected = selected.filter((item) => matches(item, rightSearch));

  function toggle(setter: typeof setLeftChecked, id: number) {
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function moveAllRight() {
    const movable = visibleAvailable.filter((item) => !item.locked).map((item) => item.id);
    onChange([...value, ...movable]);
    setLeftChecked(new Set());
  }

  function moveRight() {
    onChange([...value, ...[...leftChecked].filter((id) => !assigned.has(id))]);
    setLeftChecked(new Set());
  }

  function moveLeft() {
    onChange(value.filter((id) => !rightChecked.has(id)));
    setRightChecked(new Set());
  }

  function moveAllLeft() {
    const removable = new Set(
      visibleSelected.filter((item) => !item.locked).map((item) => item.id),
    );
    onChange(value.filter((id) => !removable.has(id)));
    setRightChecked(new Set());
  }

  const canMoveAllRight = !disabled && visibleAvailable.some((item) => !item.locked);
  const canMoveAllLeft = !disabled && visibleSelected.some((item) => !item.locked);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
      <TransferPanel
        title={availableLabel}
        count={available.length}
        items={visibleAvailable}
        checked={leftChecked}
        onToggle={(id) => toggle(setLeftChecked, id)}
        search={leftSearch}
        onSearchChange={setLeftSearch}
        searchPlaceholder={searchPlaceholder}
        emptyText={t("security.transfer.nothingAvailable")}
        disabled={disabled}
      />

      <div className="flex flex-row items-center justify-center gap-3 md:flex-col">
        <ControlButton
          primary
          label={t("security.transfer.addAll")}
          onClick={moveAllRight}
          disabled={!canMoveAllRight}
        >
          <ChevronsRight size={18} className="rotate-90 md:rotate-0 rtl:md:rotate-180" />
        </ControlButton>
        <ControlButton
          label={t("security.transfer.addSelected")}
          onClick={moveRight}
          disabled={disabled || leftChecked.size === 0}
        >
          <ChevronRight size={18} className="rotate-90 md:rotate-0 rtl:md:rotate-180" />
        </ControlButton>
        <ControlButton
          label={t("security.transfer.removeSelected")}
          onClick={moveLeft}
          disabled={disabled || rightChecked.size === 0}
        >
          <ChevronLeft size={18} className="rotate-90 md:rotate-0 rtl:md:rotate-180" />
        </ControlButton>
        <ControlButton
          label={t("security.transfer.removeAll")}
          onClick={moveAllLeft}
          disabled={!canMoveAllLeft}
        >
          <ChevronsLeft size={18} className="rotate-90 md:rotate-0 rtl:md:rotate-180" />
        </ControlButton>
      </div>

      <TransferPanel
        title={assignedLabel}
        count={selected.length}
        items={visibleSelected}
        checked={rightChecked}
        onToggle={(id) => toggle(setRightChecked, id)}
        search={rightSearch}
        onSearchChange={setRightSearch}
        searchPlaceholder={searchPlaceholder}
        emptyText={t("security.transfer.nothingAssigned")}
        disabled={disabled}
      />
    </div>
  );
}
