import { useMemo, useState } from "react";

import { useOrganizationUnitHistory } from "@/features/hr/organizations/api/use-organization-units";
import { UnitTabToolbar } from "@/features/hr/organizations/components/unit-tab-toolbar";
import { downloadUnitCsv } from "@/features/hr/organizations/utils/organization-unit-export";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { UnitHistoryEvent } from "@/lib/api/generated/model";

const NO_HISTORY: UnitHistoryEvent[] = [];

function eventColor(
  eventType?: string,
): string {
  const normalized =
    eventType?.toLowerCase() ?? "";

  if (
    normalized.includes("status")
  ) {
    return "bg-emerald-500";
  }

  if (
    normalized.includes("relationship")
  ) {
    return "bg-violet-500";
  }

  if (
    normalized.includes("child")
  ) {
    return "bg-rose-400";
  }

  if (
    normalized.includes("created")
  ) {
    return "bg-green-500";
  }

  return "bg-blue-400";
}

export function UnitHistoryTab({
  orgUnitId,
}: {
  orgUnitId: number;
}) {
  const [search, setSearch] = useState("");

  const historyQuery =
    useOrganizationUnitHistory(
      orgUnitId,
    );

  const history =
    historyQuery.data ??
    NO_HISTORY;

  const filtered = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return history;
    }

    return history.filter(
      (event) =>
        event.kind
          ?.toLowerCase()
          .includes(query) ||
        event.eventType
          ?.toLowerCase()
          .includes(query) ||
        event.description
          ?.toLowerCase()
          .includes(query) ||
        event.by
          ?.toLowerCase()
          .includes(query),
    );
  }, [history, search]);

  function handleExport() {
    downloadUnitCsv(
      `unit-${orgUnitId}-history.csv`,
      filtered.map((event) => ({
        Event:
          event.kind ??
          event.eventType,
        Description:
          event.description,
        "Changed By":
          event.by,
        Date:
          event.date,
      })),
    );
  }

  if (historyQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading unit history…
      </div>
    );
  }

  if (historyQuery.isError) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        Unable to load unit history.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <UnitTabToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search history..."
        exportDisabled={filtered.length === 0}
        onExport={handleExport}
      />

      <div className="p-5">
        <h3 className="mb-5 font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
          Unit History
        </h3>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No history records found.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-[7px] top-0 w-px bg-gray-200" />

            <div className="flex flex-col gap-5">
              {filtered.map((event, index) => {
                const title =
                  event.kind ??
                  event.eventType ??
                  "Unit Updated";

                return (
                  <div
                    key={
                      event.id ??
                      `${event.date}-${index}`
                    }
                    className="relative flex gap-5"
                  >
                    <div
                      className={`relative z-10 mt-3 size-[15px] shrink-0 rounded-full ring-4 ring-white ${eventColor(
                        event.eventType ??
                          event.kind,
                      )}`}
                    />

                    <div className="flex-1 rounded-lg bg-[#f4f6f9] px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                            {title}
                          </p>

                          <p className="mt-1 font-['Inter',sans-serif] text-xs text-gray-500">
                            {event.description ??
                              "—"}
                          </p>

                          <p className="mt-1 font-['Inter',sans-serif] text-[11px] text-gray-400">
                            By{" "}
                            {event.by ??
                              "System"}
                          </p>
                        </div>

                        <span className="shrink-0 font-['Inter',sans-serif] text-xs text-gray-400">
                          {formatDate(
                            event.date,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}