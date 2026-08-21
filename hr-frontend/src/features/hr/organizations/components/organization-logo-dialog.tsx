import { useState } from "react";
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
      toast.success("Logo updated successfully");
      handleOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update logo";

      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Change Logo</DialogTitle>

          <DialogDescription>PNG or JPEG, maximum 2 MB.</DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>

          <Button disabled={!file || updateLogo.isPending} onClick={handleSave}>
            {updateLogo.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
