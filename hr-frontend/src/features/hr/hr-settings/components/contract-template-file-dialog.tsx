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
import {
  useCreateTemplateVersion,
  useUploadInitialTemplateFile,
} from "@/features/hr/hr-settings/api/use-contract-templates";
import type { ContractTemplateSummary } from "@/lib/api/generated/model";

export function ContractTemplateFileDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ContractTemplateSummary;
}) {
  const [file, setFile] = useState<File | null>(null);
  const templateId = template?.contractTemplateId ?? 0;
  const isNewVersion = template?.fileUploaded ?? false;

  const uploadInitial = useUploadInitialTemplateFile(templateId);
  const createVersion = useCreateTemplateVersion(templateId);

  const pending = uploadInitial.isPending || createVersion.isPending;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFile(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleUpload() {
    if (!file) {
      return;
    }

    try {
      if (isNewVersion) {
        await createVersion.mutateAsync(file);
        toast.success("New template version uploaded");
      } else {
        await uploadInitial.mutateAsync(file);
        toast.success("Template file uploaded");
      }

      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload the template file",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {isNewVersion ? "Upload New Version" : "Upload Template File"}
          </DialogTitle>

          <DialogDescription>
            {template?.templateNameEn ?? template?.templateCode}
            {isNewVersion
              ? " — this replaces the current version with a new one."
              : " — this template has no file yet."}
          </DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept=".doc,.docx,.pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>

          <Button disabled={!file || pending} onClick={handleUpload}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
