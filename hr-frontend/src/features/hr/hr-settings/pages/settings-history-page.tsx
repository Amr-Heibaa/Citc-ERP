import { useState } from "react";
import { useNavigate } from "react-router";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHrSettingsHistory } from "@/features/hr/hr-settings/api/use-settings-summary";
import { formatDate } from "@/features/hr/shared/utils/format";

const ALL_DOMAINS = "__all__";

const DOMAIN_OPTIONS = [
  { value: "EMPLOYEE_STATUS", label: "Employee Statuses" },
  { value: "CONTRACT_TYPE", label: "Contract Types" },
  { value: "SKILL", label: "Skills" },
  { value: "FUNCTIONAL_RELATION_TYPE", label: "Functional Relation Types" },
];

export function SettingsHistoryPage() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);

  const history = useHrSettingsHistory(domain, undefined, page);
  const rows = history.data?.content ?? [];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/hr/settings")}
          className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
        >
          ← HR Settings
        </button>

        <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
          Settings History
        </h1>

        <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
          Audit trail of changes across all HR settings.
        </p>
      </div>

      <Select
        value={domain ?? ALL_DOMAINS}
        onValueChange={(value) => {
          setDomain(value === ALL_DOMAINS ? undefined : value);
          setPage(0);
        }}
      >
        <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-64">
          <SelectValue placeholder="All Domains" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_DOMAINS}>All Domains</SelectItem>

          {DOMAIN_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {history.isLoading ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            Loading history…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
            No events recorded yet.
          </div>
        ) : (
          <ol className="relative ml-2 border-l border-gray-200 p-4">
            {rows.map((event) => (
              <li key={event.hrSettingEventId} className="relative mb-5 ml-5 last:mb-0">
                <span className="absolute -left-[27px] mt-1 size-2.5 rounded-full bg-[#f5841f]" />

                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                    {event.eventType}
                  </p>

                  <span className="font-['Inter',sans-serif] text-xs text-gray-400">
                    {formatDate(event.createdAt?.slice(0, 10))}
                  </span>
                </div>

                <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-500">
                  {event.description}
                </p>

                <p className="font-['Inter',sans-serif] text-xs text-gray-400">
                  {event.settingDomain} · by {event.performedByName ?? "System"}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {(history.data?.totalElements ?? 0) > 0 && (
        <div className="flex items-center justify-between font-['Inter',sans-serif] text-xs text-gray-400">
          <span>
            Page {page + 1} of {Math.max(history.data?.totalPages ?? 1, 1)} ·{" "}
            {history.data?.totalElements} total
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
              className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page + 1 >= (history.data?.totalPages ?? 0)}
              onClick={() => setPage(page + 1)}
              className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
