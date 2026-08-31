import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateOrganizationLogo } from "@/features/hr/organizations/api/use-organizations";

export function OrganizationLogoDialog({
  organizationId,
  open,
  onOpenChange,
}: {
  organizationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const updateLogo = useUpdateOrganizationLogo(organizationId);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFile(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleSave() {
    if (!file) {
      return;
    }

    try {
      await updateLogo.mutateAsync(file);
      toast.success(t("organizations.logoDialog.success"));
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("organizations.logoDialog.error");

      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t("organizations.logoDialog.title")}</DialogTitle>

          <DialogDescription>{t("organizations.logoDialog.description")}</DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t("common.cancel")}
          </Button>

          <Button disabled={!file || updateLogo.isPending} onClick={handleSave}>
            {updateLogo.isPending ? t("organizations.form.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
