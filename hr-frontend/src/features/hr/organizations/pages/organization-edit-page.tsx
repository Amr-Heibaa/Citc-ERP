import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useOrganizationDetail,
  useUpdateOrganization,
} from "@/features/hr/organizations/api/use-organizations";
import { OrganizationForm } from "@/features/hr/organizations/components/organization-form";
import {
  organizationDetailToFormValues,
  toUpdateOrganizationRequest,
} from "@/features/hr/organizations/schemas/organization-mappers";
import type { OrganizationFormValues } from "@/features/hr/organizations/schemas/organization-schema";

export function OrganizationEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const id = Number(organizationId);

  const organization = useOrganizationDetail(id);
  const updateOrganization = useUpdateOrganization(id);

  function close() {
    navigate(`/hr/organizations/${id}`);
  }

  async function handleSubmit(values: OrganizationFormValues) {
    try {
      await updateOrganization.mutateAsync(toUpdateOrganizationRequest(values));

      toast.success(t("organizations.editSuccess"));
      close();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : t("organizations.editError");

      toast.error(message);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(900px, 95vw)",
          maxWidth: "none",
          height: "min(860px, 92vh)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="font-['Inter',sans-serif] text-2xl text-[#1a2535]">
            {t("organizations.editTitle")}
          </DialogTitle>

          <DialogDescription>
            {t("organizations.editDescription")}
          </DialogDescription>
        </DialogHeader>

        {organization.isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-400">
            {t("organizations.loading")}
          </div>
        ) : organization.isError || !organization.data ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">{t("organizations.notFound")}</p>

            <Button variant="outline" onClick={() => navigate("/hr/organizations")}>
              {t("organizations.backToOrganizations")}
            </Button>
          </div>
        ) : (
          <OrganizationForm
            defaultValues={organizationDetailToFormValues(organization.data)}
            submitLabel={t("organizations.editSubmit")}
            pending={updateOrganization.isPending}
            onCancel={close}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
