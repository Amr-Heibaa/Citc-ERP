import { Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationsFiltersStore } from "@/features/hr/organizations/store/organizations-filters-store";

const ALL_TYPES = "__all-types__";
const ALL_STATUSES = "__all-statuses__";

export function OrganizationsFiltersBar({
  types,
  onExport,
  exportDisabled,
}: {
  types: [id: string, label: string][];
  onExport: () => void;
  exportDisabled: boolean;
}) {
  const search = useOrganizationsFiltersStore((state) => state.search);
  const typeId = useOrganizationsFiltersStore((state) => state.typeId);
  const status = useOrganizationsFiltersStore((state) => state.status);
  const setSearch = useOrganizationsFiltersStore((state) => state.setSearch);
  const setTypeId = useOrganizationsFiltersStore((state) => state.setTypeId);
  const setStatus = useOrganizationsFiltersStore((state) => state.setStatus);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2.5">
        <Search size={16} className="shrink-0 text-gray-400" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search for name, code..."
          className="h-auto min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter',sans-serif] text-sm text-gray-600 shadow-none outline-none placeholder:text-gray-400 focus-visible:ring-0"
        />
      </div>

      <Select
        value={typeId || ALL_TYPES}
        onValueChange={(value) => setTypeId(value === ALL_TYPES ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-48">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_TYPES}>All Types</SelectItem>

          {types.map(([id, label]) => (
            <SelectItem key={id} value={id}>
              {label}
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
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={onExport}
        disabled={exportDisabled}
        className="h-10 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
      >
        <Download size={15} />
        Export
      </Button>
    </div>
  );
}
