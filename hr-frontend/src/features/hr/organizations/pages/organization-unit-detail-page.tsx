import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { useOrganizationUnitDetail } from "@/features/hr/organizations/api/use-organization-units";
import { OrganizationUnitDetailHero } from "@/features/hr/organizations/components/organization-unit-detail-hero";
import { OrganizationUnitDetailTabs } from "@/features/hr/organizations/components/organization-unit-detail-tabs";

export function OrganizationUnitDetailPage() {
  const navigate = useNavigate();

  const { organizationId, orgUnitId } = useParams();

  const organizationNumericId = Number(organizationId);

  const unitNumericId = Number(orgUnitId);

  const {
    data: unit,
    isLoading,
    isError,
  } = useOrganizationUnitDetail(unitNumericId);

  function backToOrganization() {
    navigate(`/hr/organizations/${organizationNumericId}`);
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Loading organization unit…
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-red-600">Organization unit not found.</p>

        <Button variant="outline" onClick={backToOrganization}>
          Back to organization
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2 font-['Inter',sans-serif] text-xs text-gray-400">
        <Button variant="ghost" size="icon" onClick={backToOrganization}>
          <ArrowLeft className="size-4" />
        </Button>

        <button
          type="button"
          onClick={() => navigate("/hr/organizations")}
          className="hover:text-[#1a2535]"
        >
          Organizations
        </button>

        <ChevronRight className="size-3" />

        <button
          type="button"
          onClick={backToOrganization}
          className="hover:text-[#1a2535]"
        >
          Organization Details
        </button>

        <ChevronRight className="size-3" />

        <span className="font-medium text-[#1a2535]">
          {unit.name ?? "Unit Details"}
        </span>
      </div>
      <OrganizationUnitDetailHero unit={unit} />
      <OrganizationUnitDetailTabs
        organizationId={organizationNumericId}
        orgUnitId={unitNumericId}
        unit={unit}
      />{" "}
    </div>
  );
}
