import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmploymentFiltersStore } from "@/features/hr/employment/store/employment-filters-store";

const ALL_ORG_UNITS = "__all-org-units__";
const ALL_STATUSES = "__all-statuses__";

export function EmploymentFiltersBar({
  orgUnits,
  statuses,
}: {
  orgUnits: string[];
  statuses: [code: string, name: string][];
}) {
  const search = useEmploymentFiltersStore((state) => state.search);
  const orgUnit = useEmploymentFiltersStore((state) => state.orgUnit);
  const status = useEmploymentFiltersStore((state) => state.status);
  const setSearch = useEmploymentFiltersStore((state) => state.setSearch);
  const setOrgUnit = useEmploymentFiltersStore((state) => state.setOrgUnit);
  const setStatus = useEmploymentFiltersStore((state) => state.setStatus);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2.5">
        <Search size={16} className="shrink-0 text-gray-400" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search for name, ID or email..."
          className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter',sans-serif] text-sm text-gray-600 shadow-none outline-none placeholder:text-gray-400 focus-visible:ring-0"
        />
      </div>

      <Select
        value={orgUnit || ALL_ORG_UNITS}
        onValueChange={(value) => setOrgUnit(value === ALL_ORG_UNITS ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-48">
          <SelectValue placeholder="All Organization Units" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_ORG_UNITS}>All Organization Units</SelectItem>

          {orgUnits.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status || ALL_STATUSES}
        onValueChange={(value) => setStatus(value === ALL_STATUSES ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_STATUSES}>All Status</SelectItem>

          {statuses.map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
