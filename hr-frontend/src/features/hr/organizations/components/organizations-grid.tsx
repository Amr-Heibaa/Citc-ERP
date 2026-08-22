import {
  AlertCircle,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { OrganizationSummary } from "@/lib/api/generated/model";

function OrganizationCard({
  organization,
  onSelect,
}: {
  organization: OrganizationSummary;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex min-h-32 flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#f5841f]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-['Inter',sans-serif] text-lg font-semibold text-[#1a2535] group-hover:text-[#f5841f]">
            Organization #
            {organization.code ??
              "—"}
          </p>

          <p className="mt-1 truncate font-['Inter',sans-serif] text-sm text-gray-500">
            {organization.nameEn ??
              "—"}
          </p>
        </div>

        <OrganizationStatusBadge
          status={
            organization.status
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 font-['Inter',sans-serif] text-xs text-gray-500">
          <CalendarDays className="size-4 text-gray-400" />

          {formatDate(
            organization.establishedDate,
          )}
        </span>

        <p
          dir="rtl"
          className="truncate text-left font-['Inter',sans-serif] text-sm text-gray-500"
        >
          {organization.nameAr ??
            "—"}
        </p>
      </div>
    </button>
  );
}

export function OrganizationsGrid({
  organizations,
  total,
  isLoading,
  isError,
  onRetry,
  onSelect,
}: {
  organizations: OrganizationSummary[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelect: (
    organization:
      OrganizationSummary,
  ) => void;
}) {
  return (
    <div className="min-h-[420px] rounded-xl border border-gray-100 bg-white p-4">
      {isError ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="size-9 text-red-400" />

          <div>
            <p className="font-semibold text-[#1a2535]">
              Unable to load organizations
            </p>

            <p className="text-sm text-gray-400">
              Check the server connection and try again.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onRetry}
          >
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from(
            { length: 4 },
            (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-xl bg-gray-100"
              />
            ),
          )}
        </div>
      ) : organizations.length ===
        0 ? (
        <div className="flex min-h-72 items-center justify-center text-sm text-gray-400">
          No organizations match the current filters.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {organizations.map(
              (organization) => (
                <OrganizationCard
                  key={
                    organization.id
                  }
                  organization={
                    organization
                  }
                  onSelect={() =>
                    onSelect(
                      organization,
                    )
                  }
                />
              ),
            )}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Showing{" "}
            {organizations.length}{" "}
            of {total}
          </p>
        </>
      )}
    </div>
  );
}