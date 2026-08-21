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

      toast.success("Organization updated successfully");
      close();
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to update organization";

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
            Edit Organization
          </DialogTitle>

          <DialogDescription>
            Update the organization's registration and contact details.
          </DialogDescription>
        </DialogHeader>

        {organization.isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-400">
            Loading organization…
          </div>
        ) : organization.isError || !organization.data ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">Organization not found.</p>

            <Button variant="outline" onClick={() => navigate("/hr/organizations")}>
              Back to organizations
            </Button>
          </div>
        ) : (
          <OrganizationForm
            defaultValues={organizationDetailToFormValues(organization.data)}
            submitLabel="Save Changes"
            pending={updateOrganization.isPending}
            onCancel={close}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
