import {
  Download,
  Search,
} from "lucide-react";

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

const ALL_STATUSES =
  "__all-statuses__";

export function OrganizationsFiltersBar({
  onExport,
  exportDisabled,
}: {
  onExport: () => void;
  exportDisabled: boolean;
}) {
  const search =
    useOrganizationsFiltersStore(
      (state) => state.search,
    );

  const status =
    useOrganizationsFiltersStore(
      (state) => state.status,
    );

  const setSearch =
    useOrganizationsFiltersStore(
      (state) =>
        state.setSearch,
    );

  const setStatus =
    useOrganizationsFiltersStore(
      (state) =>
        state.setStatus,
    );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1a2535] bg-white p-3 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3">
        <Search className="size-4 shrink-0 text-gray-400" />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search for Name, ID..."
          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <Select
        value={
          status ||
          ALL_STATUSES
        }
        onValueChange={(
          value,
        ) =>
          setStatus(
            value ===
              ALL_STATUSES
              ? ""
              : value,
          )
        }
      >
        <SelectTrigger className="h-10 w-full lg:w-44">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem
            value={
              ALL_STATUSES
            }
          >
            All Status
          </SelectItem>

          <SelectItem value="Active">
            Active
          </SelectItem>

          <SelectItem value="Inactive">
            Inactive
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={onExport}
        disabled={exportDisabled}
        className="h-10 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
      >
        <Download className="size-4" />
        Export
      </Button>
    </div>
  );
}