import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { OrganizationLogoDialog } from "@/features/hr/organizations/components/organization-logo-dialog";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import {
  InfoRow,
  SectionTitle,
} from "@/features/hr/shared/components/info-row";
import { formatDate } from "@/features/hr/shared/utils/format";
import { OrganizationSummaryRow } from "@/features/hr/organizations/components/organization-summary-row";
import type { OrganizationDetail } from "@/lib/api/generated/model";

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-[#f8f9fb] p-5">
      <SectionTitle>{title}</SectionTitle>

      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

export function OrganizationDetailBody({
  organization,
}: {
  organization: OrganizationDetail;
}) {
  const { t } = useTranslation();
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);

  const summary = organization.summary;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <DetailSection title={t("organizations.body.organizationInformation")}>
            <InfoRow label={t("organizations.body.organizationCode")} value={organization.code} />

            <InfoRow label={t("organizations.body.organizationType")} value={organization.type} />

            <InfoRow label={t("organizations.body.nameEn")} value={organization.nameEn} />

            <InfoRow
              label={t("organizations.body.nameAr")}
              value={
                organization.nameAr ? (
                  <span dir="rtl">{organization.nameAr}</span>
                ) : null
              }
            />

            <InfoRow
              label={t("common.status")}
              value={<OrganizationStatusBadge status={organization.status} />}
            />

            <InfoRow
              label={t("organizations.body.establishedDate")}
              value={formatDate(organization.establishedDate)}
            />

            <InfoRow
              label={t("organizations.body.registrationNumber")}
              value={organization.registrationNumber}
            />

            <InfoRow label={t("organizations.body.taxNumber")} value={organization.taxNumber} />
          </DetailSection>

          <DetailSection title={t("organizations.body.address")}>
            <InfoRow label={t("organizations.body.country")} value={organization.country} />

            <InfoRow label={t("organizations.body.state")} value={organization.state} />

            <InfoRow label={t("organizations.body.city")} value={organization.city} />

            <InfoRow label={t("organizations.body.postalCode")} value={organization.postalCode} />

            <InfoRow label={t("organizations.body.address")} value={organization.address} />
          </DetailSection>
        </div>

        <div className="flex flex-col gap-5">
          <section className="flex min-h-44 items-center justify-between gap-6 rounded-xl border border-gray-200 bg-[#f8f9fb] p-5">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoDialogOpen(true)}
              >
                <ImageIcon className="size-4" />
                {t("organizations.body.changePhoto")}
              </Button>

              <p className="mt-2 font-['Inter',sans-serif] text-xs text-gray-400">
                {t("organizations.body.photoHint")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLogoDialogOpen(true)}
              className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white transition-opacity hover:opacity-90"
            >
              {organization.logoDataUrl ? (
                <img
                  src={organization.logoDataUrl}
                  alt={organization.nameEn ?? t("organizations.detail.logoFallback")}
                  className="size-full object-contain"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-[#f5841f] px-2 text-center font-['Inter',sans-serif] text-lg font-bold text-white">
                  {organization.logoText ?? organization.code ?? "ORG"}
                </span>
              )}
            </button>
          </section>

          <DetailSection title={t("organizations.body.quickSummary")}>
            <OrganizationSummaryRow
              label={t("organizations.body.organizationUnits")}
              value={summary?.units ?? 0}
            />

            <OrganizationSummaryRow
              label={t("organizations.body.employees")}
              value={summary?.employees ?? 0}
            />

            <OrganizationSummaryRow
              label={t("organizations.body.activePositions")}
              value={summary?.activePositions ?? 0}
            />

            <OrganizationSummaryRow
              label={t("organizations.body.openPositions")}
              value={summary?.openPositions ?? 0}
            />
          </DetailSection>

          <DetailSection title={t("organizations.body.contactInformation")}>
            <InfoRow label={t("common.phone")} value={organization.phone} />

            <InfoRow label={t("common.email")} value={organization.email} />

            <InfoRow label={t("organizations.body.fax")} value={organization.fax} />

            <InfoRow label={t("organizations.body.website")} value={organization.website} />
          </DetailSection>
        </div>
      </div>

      <OrganizationLogoDialog
        organizationId={organization.id ?? 0}
        open={logoDialogOpen}
        onOpenChange={setLogoDialogOpen}
      />
    </>
  );
}
