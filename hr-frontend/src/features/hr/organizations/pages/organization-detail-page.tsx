import {
  useNavigate,
  useParams,
} from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useOrganizationDetail } from "@/features/hr/organizations/api/use-organizations";
import { OrganizationDetailHero } from "@/features/hr/organizations/components/organization-detail-hero";
import { OrganizationDetailTabs } from "@/features/hr/organizations/components/organization-detail-tabs";

export function OrganizationDetailPage() {
  const { t } = useTranslation();
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
        {t("organizations.loading")}
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
          {t("organizations.notFound")}
        </p>

        <Button
          variant="outline"
          onClick={() =>
            navigate(
              "/hr/organizations",
            )
          }
        >
          {t("organizations.backToList")}
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