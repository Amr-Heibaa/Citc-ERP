import {
  useNavigate,
  useParams,
} from "react-router";

import { Button } from "@/components/ui/button";
import { useOrganizationDetail } from "@/features/hr/organizations/api/use-organizations";
import { OrganizationDetailHero } from "@/features/hr/organizations/components/organization-detail-hero";
import { OrganizationDetailTabs } from "@/features/hr/organizations/components/organization-detail-tabs";

export function OrganizationDetailPage() {
  const navigate = useNavigate();
  const { organizationId } =
    useParams();

  const id = Number(organizationId);

  const {
    data: organization,
    isLoading,
    isError,
  } = useOrganizationDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-['Inter',sans-serif] text-gray-400">
        Loading organization…
      </div>
    );
  }

  if (
    isError ||
    !organization
  ) {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-[#c0392b]">
          Organization not found.
        </p>

        <Button
          variant="outline"
          onClick={() =>
            navigate(
              "/hr/organizations",
            )
          }
        >
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <OrganizationDetailHero
        organization={organization}
      />

      <OrganizationDetailTabs
        organizationId={id}
        organization={organization}
      />
    </div>
  );
}