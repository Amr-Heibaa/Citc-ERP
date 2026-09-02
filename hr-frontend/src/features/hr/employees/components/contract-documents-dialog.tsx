import { Download, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
  useContractDocuments,
  useGenerateContractDocument,
  useUploadSignedDocument,
} from "@/features/hr/employees/api/use-contract-documents";
import { downloadContractDocumentFile } from "@/features/hr/employees/utils/contract-document-download";
import type { ContractDetail } from "@/lib/api/generated/model";

export function ContractDocumentsDialog({
  open,
  onOpenChange,
  employeeId,
  contract,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  contract: ContractDetail;
}) {
  const { t } = useTranslation();
  const contractId = contract.contractId ?? 0;
  const [signedFile, setSignedFile] = useState<File | null>(null);

  const documents = useContractDocuments(employeeId, contractId);
  const rows = documents.data ?? [];

  const generate = useGenerateContractDocument(employeeId, contractId);
  const uploadSigned = useUploadSignedDocument(employeeId, contractId);

  async function handleGenerate() {
    try {
      await generate.mutateAsync();
      toast.success(t("employees.contractsTab.documentsDialog.generateSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("employees.contractsTab.documentsDialog.generateError"),
      );
    }
  }

  async function handleUploadSigned() {
    if (!signedFile) {
      return;
    }

    try {
      await uploadSigned.mutateAsync(signedFile);
      toast.success(t("employees.contractsTab.documentsDialog.uploadSuccess"));
      setSignedFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("employees.contractsTab.documentsDialog.uploadError"),
      );
    }
  }

  function handleDownload(documentId: number, fileName?: string) {
    downloadContractDocumentFile(
      employeeId,
      contractId,
      documentId,
      fileName ?? `contract-${contractId}-document-${documentId}`,
    ).catch(() => {
      toast.error(t("employees.contractsTab.documentsDialog.unableToLoad"));
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl text-[#1a2535]">
            <FileText className="size-5 text-[#f5841f]" />
            {t("employees.contractsTab.documentsDialog.title", {
              number: contract.contractNumber ?? contract.contractId,
            })}
          </DialogTitle>

          <DialogDescription>
            {t("employees.contractsTab.documentsDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={generate.isPending}
              onClick={handleGenerate}
            >
              {generate.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generate.isPending
                ? t("employees.contractsTab.documentsDialog.generating")
                : t("employees.contractsTab.documentsDialog.generate")}
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fb] p-3">
            <Input
              type="file"
              accept=".doc,.docx,.pdf"
              onChange={(event) => setSignedFile(event.target.files?.[0] ?? null)}
            />

            <Button
              type="button"
              size="sm"
              className="w-fit"
              disabled={!signedFile || uploadSigned.isPending}
              onClick={handleUploadSigned}
            >
              {uploadSigned.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploadSigned.isPending
                ? t("employees.contractsTab.documentsDialog.uploading")
                : t("employees.contractsTab.documentsDialog.uploadSigned")}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {documents.isLoading ? (
              <p className="py-6 text-center text-sm text-gray-400">
                {t("employees.contractsTab.documentsDialog.loading")}
              </p>
            ) : documents.isError ? (
              <p className="py-6 text-center text-sm text-red-600">
                {t("employees.contractsTab.documentsDialog.unableToLoad")}
              </p>
            ) : rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                {t("employees.contractsTab.documentsDialog.noDocuments")}
              </p>
            ) : (
              rows.map((doc) => (
                <div
                  key={doc.contractDocumentId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1a2535]">
                      {doc.fileName ?? doc.fileFormat}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge
                        className={`border-0 text-[11px] ${
                          doc.documentKind === "SIGNED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {doc.documentKind === "SIGNED"
                          ? t("employees.contractsTab.documentsDialog.signed")
                          : t("employees.contractsTab.documentsDialog.generated")}
                      </Badge>

                      {doc.current && (
                        <Badge className="border-0 bg-gray-200 text-[11px] text-gray-600">
                          {t("employees.contractsTab.documentsDialog.current")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={t("employees.contractsTab.documentsDialog.download")}
                    onClick={() =>
                      doc.contractDocumentId != null &&
                      handleDownload(doc.contractDocumentId, doc.fileName)
                    }
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-gray-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("employees.contractsTab.documentsDialog.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
