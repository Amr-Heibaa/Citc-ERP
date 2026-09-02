import { Download, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContractTypes } from "@/features/hr/employees/api/use-employees";
import { ContractTemplateFileDialog } from "@/features/hr/hr-settings/components/contract-template-file-dialog";
import { SettingStatusBadge } from "@/features/hr/hr-settings/components/setting-status-badge";
import {
  useActivateTemplate,
  useContractTemplates,
  useDeactivateTemplate,
} from "@/features/hr/hr-settings/api/use-contract-templates";
import { downloadContractTemplateFile } from "@/features/hr/hr-settings/utils/contract-template-download";
import { formatDate } from "@/features/hr/shared/utils/format";
import type { ContractTemplateSummary } from "@/lib/api/generated/model";

const ALL_TYPES = "__all__";

function TemplateActivationButton({ template }: { template: ContractTemplateSummary }) {
  const templateId = template.contractTemplateId ?? 0;
  const activate = useActivateTemplate(templateId);
  const deactivate = useDeactivateTemplate(templateId);
  const pending = activate.isPending || deactivate.isPending;

  async function handleClick() {
    try {
      if (template.active) {
        await deactivate.mutateAsync();
        toast.success("Template deactivated");
      } else {
        await activate.mutateAsync();
        toast.success("Template activated");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update the template status",
      );
    }
  }

  return (
    <Button variant="ghost" size="sm" disabled={pending} onClick={handleClick}>
      {template.active ? "Deactivate" : "Activate"}
    </Button>
  );
}

export function ContractTemplatesPage() {
  const navigate = useNavigate();
  const [contractTypeId, setContractTypeId] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplateSummary>();

  const contractTypes = useContractTypes();
  const templates = useContractTemplates(true);
  const rows = templates.data ?? [];

  const contractTypeName = useMemo(() => {
    const map = new Map(
      contractTypes.data?.map((type) => [type.id, type.name ?? type.code]) ?? [],
    );

    return (id?: number) => (id != null ? (map.get(id) ?? "—") : "—");
  }, [contractTypes.data]);

  const filtered = contractTypeId
    ? rows.filter((row) => String(row.contractTypeId) === contractTypeId)
    : rows;

  function openFileDialog(template: ContractTemplateSummary) {
    setSelectedTemplate(template);
    setFileDialogOpen(true);
  }

  function handleDownload(template: ContractTemplateSummary) {
    if (template.contractTemplateId == null) {
      return;
    }

    downloadContractTemplateFile(
      template.contractTemplateId,
      `${template.templateCode ?? "template"}-v${template.versionNumber ?? 1}`,
    ).catch(() => {
      toast.error("Unable to download the template file");
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate("/hr/settings")}
              className="font-['Inter',sans-serif] text-xs text-gray-400 hover:text-gray-600"
            >
              ← HR Settings
            </button>

            <h1 className="mt-1 font-['Inter',sans-serif] text-2xl font-bold text-[#1a2535]">
              Contract Templates
            </h1>

            <p className="mt-0.5 font-['Inter',sans-serif] text-sm text-gray-400">
              Manage the document templates used to generate employee contracts.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center">
          <Select
            value={contractTypeId || ALL_TYPES}
            onValueChange={(value) => setContractTypeId(value === ALL_TYPES ? "" : value)}
          >
            <SelectTrigger className="h-10 w-full font-['Inter',sans-serif] text-sm text-gray-600 lg:w-56">
              <SelectValue placeholder="All Contract Types" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={ALL_TYPES}>All Contract Types</SelectItem>

              {contractTypes.data?.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name ?? type.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {templates.isLoading ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              Loading contract templates…
            </div>
          ) : templates.isError ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-red-600">
              Unable to load contract templates.
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-48 items-center justify-center font-['Inter',sans-serif] text-sm text-gray-400">
              No contract templates match the current filter.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#f4f6f9]">
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((template) => (
                  <TableRow key={template.contractTemplateId}>
                    <TableCell>
                      <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                        {template.templateNameEn ?? template.templateCode}
                      </p>

                      <p className="text-xs text-gray-400">{template.templateCode}</p>
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {contractTypeName(template.contractTypeId)}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      v{template.versionNumber ?? 1}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(template.effectiveFrom)}
                    </TableCell>

                    <TableCell className="font-['Inter',sans-serif] text-sm text-gray-600">
                      {formatDate(template.effectiveTo)}
                    </TableCell>

                    <TableCell>
                      <SettingStatusBadge active={template.active ?? false} />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {template.fileUploaded && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download template file"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="size-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          title={template.fileUploaded ? "Upload new version" : "Upload template file"}
                          onClick={() => openFileDialog(template)}
                        >
                          <Upload className="size-4" />
                        </Button>

                        <TemplateActivationButton template={template} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <ContractTemplateFileDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        template={selectedTemplate}
      />
    </>
  );
}
