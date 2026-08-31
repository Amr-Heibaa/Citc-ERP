import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateOrganization } from "@/features/hr/organizations/api/use-organizations";
import { OrganizationForm } from "@/features/hr/organizations/components/organization-form";
import { toCreateOrganizationRequest } from "@/features/hr/organizations/schemas/organization-mappers";
import type { OrganizationFormValues } from "@/features/hr/organizations/schemas/organization-schema";

const EMPTY_DEFAULTS: OrganizationFormValues = {
  code: "",
  nameEn: "",
  nameAr: "",
  organizationTypeId: "",
  active: true,
  establishedDate: "",
  registrationNumber: "",
  taxNumber: "",
  phone: "",
  email: "",
  fax: "",
  website: "",
  countryId: "",
  stateId: "",
  cityId: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
};

export function OrganizationCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createOrganization = useCreateOrganization();

  function close() {
    navigate("/hr/organizations");
  }

  async function handleSubmit(
    values: OrganizationFormValues,
    logo: { base64: string; contentType: string } | null,
  ) {
    try {
      const created = await createOrganization.mutateAsync(
        toCreateOrganizationRequest(values, logo ?? undefined),
      );

      toast.success(t("organizations.createSuccess"));
      navigate(`/hr/organizations/${created.id}`);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : t("organizations.createError");

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
            {t("organizations.createTitle")}
          </DialogTitle>

          <DialogDescription>
            {t("organizations.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <OrganizationForm
          defaultValues={EMPTY_DEFAULTS}
          showLogoPicker
          submitLabel={t("organizations.createSubmit")}
          pending={createOrganization.isPending}
          onCancel={close}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
