import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { OrganizationLogoDialog } from "@/features/hr/organizations/components/organization-logo-dialog";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import {
  InfoRow,
  SectionTitle,
} from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { OrganizationDetail } from "@/lib/api/generated/model";

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0">
      <span className="font-['Inter',sans-serif] text-sm text-gray-400">
        {label}
      </span>

      <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
        {value}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-[#f8f9fb] p-5">
      <SectionTitle>
        {title}
      </SectionTitle>

      <div className="flex flex-col gap-2">
        {children}
      </div>
    </section>
  );
}

export function OrganizationDetailBody({
  organization,
}: {
  organization: OrganizationDetail;
}) {
  const [
    logoDialogOpen,
    setLogoDialogOpen,
  ] = useState(false);

  const summary =
    organization.summary;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailSection title="Organization Information">
            <InfoRow
              label="Organization Code"
              value={organization.code}
            />

            <InfoRow
              label="Organization Type"
              value={organization.type}
            />

            <InfoRow
              label="Name (English)"
              value={organization.nameEn}
            />

            <InfoRow
              label="Name (Arabic)"
              value={
                organization.nameAr ? (
                  <span dir="rtl">
                    {organization.nameAr}
                  </span>
                ) : null
              }
            />

            <InfoRow
              label="Status"
              value={
                <OrganizationStatusBadge
                  status={
                    organization.status
                  }
                />
              }
            />

            <InfoRow
              label="Established Date"
              value={formatDate(
                organization.establishedDate,
              )}
            />

            <InfoRow
              label="Registration Number"
              value={
                organization.registrationNumber
              }
            />

            <InfoRow
              label="Tax Number"
              value={
                organization.taxNumber
              }
            />
          </DetailSection>

          <DetailSection title="Address">
            <InfoRow
              label="Country"
              value={organization.country}
            />

            <InfoRow
              label="State"
              value={organization.state}
            />

            <InfoRow
              label="City"
              value={organization.city}
            />

            <InfoRow
              label="Postal Code"
              value={
                organization.postalCode
              }
            />

            <InfoRow
              label="Address"
              value={organization.address}
            />
          </DetailSection>
        </div>

        <div className="flex flex-col gap-5">
          <section className="flex min-h-44 items-center justify-between gap-6 rounded-xl border border-gray-200 bg-[#f8f9fb] p-5">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLogoDialogOpen(
                    true,
                  )
                }
              >
                <ImageIcon className="size-4" />
                Change Photo
              </Button>

              <p className="mt-2 font-['Inter',sans-serif] text-xs text-gray-400">
                JPG or PNG, maximum
                2 MB
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setLogoDialogOpen(
                  true,
                )
              }
              className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f5841f]"
            >
              {organization.logoDataUrl ? (
                <img
                  src={
                    organization.logoDataUrl
                  }
                  alt={
                    organization.nameEn ??
                    "Organization logo"
                  }
                  className="size-full object-contain"
                />
              ) : (
                <span className="font-['Inter',sans-serif] text-lg font-bold text-white">
                  {organization.logoText ??
                    organization.code ??
                    "ORG"}
                </span>
              )}
            </button>
          </section>

          <DetailSection title="Quick Summary">
            <SummaryRow
              label="Organization Units"
              value={
                summary?.units ?? 0
              }
            />

            <SummaryRow
              label="Employees"
              value={
                summary?.employees ??
                0
              }
            />

            <SummaryRow
              label="Active Positions"
              value={
                summary
                  ?.activePositions ??
                0
              }
            />

            <SummaryRow
              label="Open Positions"
              value={
                summary
                  ?.openPositions ??
                0
              }
            />
          </DetailSection>

          <DetailSection title="Contact Information">
            <InfoRow
              label="Phone"
              value={organization.phone}
            />

            <InfoRow
              label="Email"
              value={organization.email}
            />

            <InfoRow
              label="Fax"
              value={organization.fax}
            />

            <InfoRow
              label="Website"
              value={organization.website}
            />
          </DetailSection>
        </div>
      </div>

      <OrganizationLogoDialog
        organizationId={
          organization.id ?? 0
        }
        open={logoDialogOpen}
        onOpenChange={
          setLogoDialogOpen
        }
      />
    </>
  );
}