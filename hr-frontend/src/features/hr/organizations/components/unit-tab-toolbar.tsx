import {
  Download,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnitTabToolbar({
  search,
  onSearchChange,
  placeholder,
  exportDisabled,
  onExport,
  children,
}: {
  search: string;
  onSearchChange: (
    value: string,
  ) => void;
  placeholder: string;
  exportDisabled: boolean;
  onExport: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#f4f6f9] px-3">
        <Search className="size-4 shrink-0 text-gray-400" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder={placeholder}
          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {children}

      <Button
        onClick={onExport}
        disabled={exportDisabled}
        className="gap-2 bg-[#1a2535] text-white hover:bg-[#243347]"
      >
        <Download className="size-4" />
        Export
      </Button>
    </div>
  );
}