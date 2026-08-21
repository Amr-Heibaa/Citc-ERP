import { Briefcase, Building2, UserCheck, Users } from "lucide-react";

import { InfoRow, SectionTitle } from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { OrganizationDetail } from "@/lib/api/generated/model";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f4f6f9]">
        <Icon className="size-4 text-[#1a2535]" />
      </div>

      <div>
        <p className="font-['Inter',sans-serif] text-lg font-bold text-[#1a2535]">
          {value}
        </p>

        <p className="font-['Inter',sans-serif] text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export function OrganizationDetailBody({
  organization,
}: {
  organization: OrganizationDetail;
}) {
  const summary = organization.summary;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Building2} label="Units" value={summary?.units ?? 0} />
        <StatCard icon={Users} label="Employees" value={summary?.employees ?? 0} />
        <StatCard
          icon={UserCheck}
          label="Active Positions"
          value={summary?.activePositions ?? 0}
        />
        <StatCard
          icon={Briefcase}
          label="Open Positions"
          value={summary?.openPositions ?? 0}
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <SectionTitle>Registration</SectionTitle>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow label="Registration Number" value={organization.registrationNumber} />
            <InfoRow label="Tax Number" value={organization.taxNumber} />
            <InfoRow label="Established Date" value={formatDate(organization.establishedDate)} />
            <InfoRow label="Organization Type" value={organization.type} />
          </div>
        </div>

        <div>
          <SectionTitle>Contact</SectionTitle>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow label="Phone" value={organization.phone} />
            <InfoRow label="Email" value={organization.email} />
            <InfoRow label="Fax" value={organization.fax} />
            <InfoRow label="Website" value={organization.website} />
          </div>
        </div>

        <div>
          <SectionTitle>Address</SectionTitle>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoRow label="Country" value={organization.country} />
            <InfoRow label="State" value={organization.state} />
            <InfoRow label="City" value={organization.city} />
            <InfoRow label="Postal Code" value={organization.postalCode} />
            <div className="sm:col-span-2">
              <InfoRow label="Address" value={organization.address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
