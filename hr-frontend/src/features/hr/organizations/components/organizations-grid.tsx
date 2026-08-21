import { AlertCircle, Briefcase, Building2, CalendarDays, RefreshCw, Users } from "lucide-react";

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
      className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#f5841f]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['Inter',sans-serif] text-lg font-semibold text-[#1a2535]">
            {organization.code ?? "—"}
          </p>

          <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-500">
            {organization.nameEn ?? "—"}
          </p>

          <p
            dir="rtl"
            className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400"
          >
            {organization.nameAr}
          </p>
        </div>

        <OrganizationStatusBadge status={organization.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
        {organization.type && (
          <span className="rounded-full bg-[#f4f6f9] px-2.5 py-1 font-['Inter',sans-serif] font-medium text-gray-600">
            {organization.type}
          </span>
        )}

        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {formatDate(organization.establishedDate)}
        </span>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="size-3.5 text-gray-400" />

          <span className="font-['Inter',sans-serif] text-xs text-gray-500">
            {organization.summary?.units ?? 0} units
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-gray-400" />

          <span className="font-['Inter',sans-serif] text-xs text-gray-500">
            {organization.summary?.employees ?? 0} employees
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Briefcase className="size-3.5 text-gray-400" />

          <span className="font-['Inter',sans-serif] text-xs text-gray-500">
            {organization.summary?.openPositions ?? 0} open
          </span>
        </div>
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
  onSelect: (organization: OrganizationSummary) => void;
}) {
  if (isError) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white p-6 text-center">
        <AlertCircle className="size-9 text-red-400" />

        <div>
          <p className="font-['Inter',sans-serif] font-semibold text-[#1a2535]">
            Unable to load organizations
          </p>

          <p className="font-['Inter',sans-serif] text-sm text-gray-400">
            Check the server connection and try again.
          </p>
        </div>

        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white py-16 text-center font-['Inter',sans-serif] text-sm text-gray-400">
        No organizations match the current filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {organizations.map((organization) => (
          <OrganizationCard
            key={organization.id}
            organization={organization}
            onSelect={() => onSelect(organization)}
          />
        ))}
      </div>

      <p className="font-['Inter',sans-serif] text-xs text-gray-400">
        Showing {organizations.length} of {total}
      </p>
    </div>
  );
}
