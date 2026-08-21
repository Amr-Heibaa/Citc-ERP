import { Camera, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { OrganizationLogoDialog } from "@/features/hr/organizations/components/organization-logo-dialog";
import { OrganizationStatusBadge } from "@/features/hr/organizations/components/organization-status-badge";
import type { OrganizationDetail } from "@/lib/api/generated/model";

export function OrganizationDetailHero({
  organization,
}: {
  organization: OrganizationDetail;
}) {
  const navigate = useNavigate();
  const [logoOpen, setLogoOpen] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        background: "linear-gradient(174deg, #1a2535 25%, #243347 75%)",
      }}
    >
      <div className="flex min-h-[104px] flex-wrap items-center gap-4 px-5 py-4">
        <button
          type="button"
          onClick={() => setLogoOpen(true)}
          className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f5841f]/20"
        >
          {organization.logoDataUrl ? (
            <img
              src={organization.logoDataUrl}
              alt={organization.nameEn ?? "Organization logo"}
              className="size-full object-cover"
            />
          ) : (
            <span className="font-['Inter',sans-serif] text-xl font-bold text-white">
              {organization.logoText ?? organization.code}
            </span>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-white" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-['Inter',sans-serif] text-lg font-bold text-white">
              {organization.nameEn}
            </p>

            <OrganizationStatusBadge
              status={organization.status}
              className="border-0 bg-emerald-500/20 text-emerald-300"
            />
          </div>

          <p
            dir="rtl"
            className="truncate text-left font-['Inter',sans-serif] text-xs text-[#a4aab6]"
          >
            {organization.nameAr}
          </p>

          <p className="mt-0.5 font-['Inter',sans-serif] text-xs text-[#a4aab6]">
            {organization.code} {organization.type ? `· ${organization.type}` : ""}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate(`/hr/organizations/${organization.id}/edit`)}
          className="shrink-0"
        >
          <Pencil className="size-4" />
          Edit Organization
        </Button>
      </div>

      <OrganizationLogoDialog
        organizationId={organization.id ?? 0}
        open={logoOpen}
        onOpenChange={setLogoOpen}
      />
    </div>
  );
}
