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
import { useEmployeesFiltersStore } from "@/features/hr/employees/store/employees-filters-store";

const ALL_DEPARTMENTS = "__all-departments__";
const ALL_STATUSES = "__all-statuses__";

export function EmployeesFiltersBar({
  departments,
  statuses,
  exportDisabled,
}: {
  departments: string[];
  statuses: [code: string, name: string][];
  exportDisabled: boolean;
}) {
  const search = useEmployeesFiltersStore((state) => state.search);
  const department = useEmployeesFiltersStore((state) => state.department);
  const status = useEmployeesFiltersStore((state) => state.status);
  const setSearch = useEmployeesFiltersStore((state) => state.setSearch);
  const setDepartment = useEmployeesFiltersStore(
    (state) => state.setDepartment,
  );
  const setStatus = useEmployeesFiltersStore((state) => state.setStatus);
  const setExportOpen = useEmployeesFiltersStore(
    (state) => state.setExportOpen,
  );

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
        value={department || ALL_DEPARTMENTS}
        onValueChange={(value) =>
          setDepartment(value === ALL_DEPARTMENTS ? "" : value)
        }
      >
        <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-48">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_DEPARTMENTS}>All Departments</SelectItem>

          {departments.map((item) => (
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

      <Button
        onClick={() => setExportOpen(true)}
        disabled={exportDisabled}
        className="h-10 gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
      >
        <Download size={15} />
        Export
      </Button>
    </div>
  );
}
