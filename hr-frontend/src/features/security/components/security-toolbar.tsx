import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

export type FilterOption = { value: string; label: string };

/** Search + filters bar, same visual language as the HR filter bars. */
export function SecurityToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:flex-wrap lg:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#f5841f]/30 lg:min-w-64">
        <Search size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
        <span className="sr-only">{searchPlaceholder}</span>
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter',sans-serif] text-sm text-gray-600 shadow-none outline-none placeholder:text-gray-400 focus-visible:ring-0"
        />
      </label>

      {children}
    </div>
  );
}

/** Select where "" means "all"; Radix Select cannot use an empty item value. */
export function FilterSelect({
  value,
  onChange,
  allLabel,
  options,
  ariaLabel,
  className = "lg:w-44",
}: {
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: FilterOption[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <Select value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : next)}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={`h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 ${className}`}
      >
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
