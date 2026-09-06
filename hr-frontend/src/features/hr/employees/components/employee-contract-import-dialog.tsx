import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { useContractTypes } from "@/features/hr/employees/api/use-employees";
import {
  useConfirmContractImport,
  usePreviewContractImport,
} from "@/features/hr/employees/api/use-employees";
import {
  useConfirmDocxContractImport,
  usePreviewDocxContractImport,
} from "@/features/hr/employees/api/use-contract-docx-import";
import { ContractFieldsGrid } from "@/features/hr/employees/components/contract-form-dialog";
import {
  contractSchema,
  createContractRequestToFormValues,
  toContractRequest,
  type ContractFormValues,
} from "@/features/hr/employees/schemas/contract-schema";
import { useContractTemplates } from "@/features/hr/hr-settings/api/use-contract-templates";
import type { FieldIssue } from "@/lib/api/generated/model";

type EmployeeContractImportDialogProps = {
  employeeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Excel template headers/example values are a data contract matched by the
// backend import parser, not on-screen UI copy — intentionally left in English.
const TEMPLATE_HEADERS = [
  "Contract Type",
  "Contract Number",
  "Start Date",
  "End Date",
  "Salary",
  "Currency",
  "Hours Per Week",
  "Hours Per Month",
  "Probation Days",
  "Work Type",
  "Notes",
];

const TEMPLATE_EXAMPLE = [
  "Permanent",
  "CN-2026-0001",
  "2026-01-01",
  "",
  15000,
  "EGP",
  40,
  176,
  90,
  "Full Time",
  "Example contract",
];

async function downloadTemplate() {
  const XLSX = await import("xlsx");

  const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_EXAMPLE]);

  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");

  XLSX.writeFile(workbook, "employee-contracts-template.xlsx");
}

function isDocxFile(file: File | null): boolean {
  return file != null && /\.docx?$/i.test(file.name);
}

function IssueList({ issues }: { issues: FieldIssue[] }) {
  const errors = issues.filter((issue) => issue.severity === "ERROR");
  const warnings = issues.filter((issue) => issue.severity === "WARNING");

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fb] p-3 text-xs">
      {errors.map((issue, index) => (
        <p key={`error-${index}`} className="flex items-start gap-1.5 text-red-600">
          <XCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {issue.field && <span className="font-medium">{issue.field}: </span>}
            {issue.message}
          </span>
        </p>
      ))}

      {warnings.map((issue, index) => (
        <p key={`warning-${index}`} className="flex items-start gap-1.5 text-amber-600">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {issue.field && <span className="font-medium">{issue.field}: </span>}
            {issue.message}
          </span>
        </p>
      ))}
    </div>
  );
}

export function EmployeeContractImportDialog({
  employeeId,
  open,
  onOpenChange,
}: EmployeeContractImportDialogProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const docxMode = isDocxFile(file);

  const types = useContractTypes();
  const templates = useContractTemplates();

  const previewMutation = usePreviewContractImport(employeeId);
  const confirmMutation = useConfirmContractImport(employeeId);
  const docxPreviewMutation = usePreviewDocxContractImport(employeeId);
  const docxConfirmMutation = useConfirmDocxContractImport(employeeId);

  const preview = previewMutation.data;
  const result = confirmMutation.data;
  const docxPreview = docxPreviewMutation.data;
  const docxResult = docxConfirmMutation.data;

  const pending =
    previewMutation.isPending ||
    confirmMutation.isPending ||
    docxPreviewMutation.isPending ||
    docxConfirmMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset: resetDocxForm,
    setValue,
    formState: { errors: docxErrors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: createContractRequestToFormValues(),
  });

  const docxFulltime = useWatch({ control, name: "fulltime" });
  const docxContractTypeId = useWatch({ control, name: "contractTypeId" });

  const docxTemplateOptions =
    templates.data
      ?.filter((template) => String(template.contractTypeId) === docxContractTypeId)
      .map((template) => ({
        value: String(template.contractTemplateId),
        label: template.templateNameEn ?? template.templateCode,
      })) ?? [];

  useEffect(() => {
    if (docxPreview?.contract) {
      resetDocxForm(createContractRequestToFormValues(docxPreview.contract));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docxPreview]);

  function reset() {
    setFile(null);
    previewMutation.reset();
    confirmMutation.reset();
    docxPreviewMutation.reset();
    docxConfirmMutation.reset();
    resetDocxForm(createContractRequestToFormValues());
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && pending) {
      return;
    }

    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  }

  async function handlePreview() {
    if (!file) {
      toast.error(t("employees.contractImport.selectFileFirst"));
      return;
    }

    try {
      if (docxMode) {
        await docxPreviewMutation.mutateAsync(file);
        toast.success(t("employees.contractImport.extractedSuccess"));
      } else {
        await previewMutation.mutateAsync(file);
        toast.success(t("employees.contractImport.validatedSuccess"));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.contractImport.unableToPreview"),
      );
    }
  }

  async function handleConfirm() {
    if (!file || !preview) {
      return;
    }

    if (preview.validRows === 0) {
      toast.error(t("employees.contractImport.noValidContracts"));
      return;
    }

    try {
      const response = await confirmMutation.mutateAsync(file);

      toast.success(
        t("employees.contractImport.importedSuccess", { count: response.importedRows }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.contractImport.unableToImport"),
      );
    }
  }

  const submitDocxConfirm = handleSubmit(async (values) => {
    if (!file) {
      return;
    }

    try {
      const created = await docxConfirmMutation.mutateAsync({
        file,
        contract: toContractRequest(values),
      });

      toast.success(
        t("employees.contractImport.createdFromFile", {
          number: created.contractNumber ?? created.contractId ?? "",
        }),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("employees.contractImport.unableToCreateFromFile"),
      );
    }
  });

  const docxReviewMode = docxMode && docxPreview != null && !docxResult;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1200px, 96vw)",
          maxWidth: "none",
          height: "min(780px, 94vh)",
        }}
      >
        {docxReviewMode ? (
          <form onSubmit={submitDocxConfirm} className="contents">
            <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
              <DialogTitle className="flex items-center gap-2 text-xl text-[#1a2535]">
                <Sparkles className="size-5 text-[#f5841f]" />
                {t("employees.contractImport.reviewExtractedTitle")}
              </DialogTitle>

              <DialogDescription>
                {docxPreview?.detectedTemplateNameEn
                  ? t("employees.contractImport.detectedTemplate", {
                      name: docxPreview.detectedTemplateNameEn,
                    })
                  : ""}
                {t("employees.contractImport.reviewDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              {docxPreview?.issues && docxPreview.issues.length > 0 && (
                <IssueList issues={docxPreview.issues} />
              )}

              <ContractFieldsGrid
                register={register}
                control={control}
                errors={docxErrors}
                setValue={setValue}
                fulltime={docxFulltime}
                contractTypeId={docxContractTypeId}
                typeOptions={
                  types.data?.map((type) => ({
                    value: String(type.id),
                    label: type.name,
                  })) ?? []
                }
                templateOptions={docxTemplateOptions}
              />
            </div>

            <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => docxPreviewMutation.reset()}
              >
                {t("employees.contractImport.back")}
              </Button>

              <Button type="submit" disabled={pending}>
                {docxConfirmMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("employees.contractImport.confirmImport")}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
              <DialogTitle className="flex items-center gap-2 text-xl text-[#1a2535]">
                <FileSpreadsheet className="size-5 text-[#f5841f]" />
                {t("employees.contractImport.importTitle")}
              </DialogTitle>

              <DialogDescription>
                {t("employees.contractImport.importDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
              {!preview && !result && !docxResult && (
                <>
                  <div className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fb] p-4 md:flex-row md:items-center">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      {docxMode ? (
                        <FileText className="size-5 text-[#1a2535]" />
                      ) : (
                        <Upload className="size-5 text-[#1a2535]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1a2535]">
                        {t("employees.contractImport.contractFile")}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        {file ? file.name : t("employees.contractImport.selectFilePrompt")}
                      </p>
                    </div>

                    <input
                      type="file"
                      accept=".xlsx,.xls,.docx,.doc"
                      disabled={pending}
                      onChange={(event) => {
                        const selected = event.target.files?.[0] ?? null;

                        setFile(selected);
                        previewMutation.reset();
                        confirmMutation.reset();
                        docxPreviewMutation.reset();
                        docxConfirmMutation.reset();
                      }}
                      className="block max-w-full text-sm text-gray-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#1a2535] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                    />
                  </div>

                  {!docxMode && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit"
                      onClick={downloadTemplate}
                    >
                      <Download className="mr-2 size-4" />
                      {t("employees.contractImport.downloadTemplate")}
                    </Button>
                  )}
                </>
              )}

              {preview && !result && (
                <>
                  <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    <SummaryCard
                      label={t("employees.contractImport.summary.total")}
                      value={preview.totalRows}
                      color="text-[#1a2535]"
                    />

                    <SummaryCard
                      label={t("employees.contractImport.summary.valid")}
                      value={preview.validRows}
                      color="text-emerald-600"
                    />

                    <SummaryCard
                      label={t("employees.contractImport.summary.invalid")}
                      value={preview.invalidRows}
                      color="text-red-600"
                    />
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto rounded-xl border">
                    <table className="w-full min-w-[950px] text-left text-sm">
                      <thead className="sticky top-0 bg-[#f4f6f9] text-xs text-gray-500">
                        <tr>
                          <th className="px-4 py-3">{t("employees.contractImport.previewTable.row")}</th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.previewTable.contractType")}
                          </th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.previewTable.contractNumber")}
                          </th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.previewTable.startDate")}
                          </th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.previewTable.workType")}
                          </th>
                          <th className="px-4 py-3">{t("employees.contractImport.previewTable.status")}</th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.previewTable.message")}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(preview.rows ?? []).map((row) => {
                          const errors = row.errors ?? [];
                          const warnings = row.warnings ?? [];

                          return (
                          <tr key={row.rowNumber} className="border-t">
                            <td className="px-4 py-3 text-gray-500">{row.rowNumber}</td>

                            <td className="px-4 py-3">{row.contractType || "—"}</td>

                            <td className="px-4 py-3">{row.contractNumber || "—"}</td>

                            <td className="px-4 py-3">{row.startDate || "—"}</td>

                            <td className="px-4 py-3">
                              {row.fulltime == null
                                ? "—"
                                : row.fulltime
                                  ? t("employees.contractImport.previewTable.fullTime")
                                  : t("employees.contractImport.previewTable.partTime")}
                            </td>

                            <td className="px-4 py-3">
                              {row.valid ? (
                                <Badge className="border-0 bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="mr-1 size-3" />
                                  {t("employees.contractImport.previewTable.valid")}
                                </Badge>
                              ) : (
                                <Badge className="border-0 bg-red-100 text-red-700">
                                  <XCircle className="mr-1 size-3" />
                                  {t("employees.contractImport.previewTable.invalid")}
                                </Badge>
                              )}
                            </td>

                            <td className="max-w-[320px] px-4 py-3 text-xs">
                              {errors.length > 0 && (
                                <p className="text-red-600">{errors.join(", ")}</p>
                              )}

                              {warnings.length > 0 && (
                                <p className="mt-1 flex items-start gap-1 text-amber-600">
                                  <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                                  {warnings.join(", ")}
                                </p>
                              )}

                              {errors.length === 0 && warnings.length === 0 && (
                                <span className="text-gray-400">
                                  {t("employees.contractImport.previewTable.ready")}
                                </span>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {result && (
                <>
                  <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    <SummaryCard
                      label={t("employees.contractImport.summary.total")}
                      value={result.totalRows}
                      color="text-[#1a2535]"
                    />

                    <SummaryCard
                      label={t("employees.contractImport.summary.imported")}
                      value={result.importedRows}
                      color="text-emerald-600"
                    />

                    <SummaryCard
                      label={t("employees.contractImport.summary.skipped")}
                      value={result.skippedRows}
                      color="text-amber-600"
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                    <CheckCircle2 className="size-5" />
                    {t("employees.contractImport.importFinished")}
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-[#f4f6f9] text-xs text-gray-500">
                        <tr>
                          <th className="px-4 py-3">{t("employees.contractImport.resultTable.row")}</th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.resultTable.contractNumber")}
                          </th>
                          <th className="px-4 py-3">{t("employees.contractImport.resultTable.status")}</th>
                          <th className="px-4 py-3">
                            {t("employees.contractImport.resultTable.message")}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {result.rows.map((row) => (
                          <tr key={row.rowNumber} className="border-t">
                            <td className="px-4 py-3">{row.rowNumber}</td>

                            <td className="px-4 py-3">{row.contractNumber || "—"}</td>

                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  row.status === "IMPORTED"
                                    ? "border-0 bg-emerald-100 text-emerald-700"
                                    : "border-0 bg-amber-100 text-amber-700"
                                }
                              >
                                {row.status}
                              </Badge>
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {row.message || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {docxResult && (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <CheckCircle2 className="size-10 text-emerald-500" />

                  <p className="text-sm font-semibold text-[#1a2535]">
                    {t("employees.contractImport.docxCreatedTitle", {
                      number: docxResult.contractNumber ?? docxResult.contractId,
                    })}
                  </p>

                  <p className="max-w-md text-xs text-gray-400">
                    {t("employees.contractImport.docxCreatedDescription")}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
              {result || docxResult ? (
                <Button type="button" onClick={() => handleOpenChange(false)}>
                  {t("employees.contractImport.done")}
                </Button>
              ) : preview ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => previewMutation.reset()}
                  >
                    {t("employees.contractImport.back")}
                  </Button>

                  <Button
                    type="button"
                    disabled={pending || preview.validRows === 0}
                    onClick={handleConfirm}
                  >
                    {confirmMutation.isPending && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {t("employees.contractImport.confirmImport")}
                  </Button>
                </>
              ) : (
                <Button type="button" disabled={!file || pending} onClick={handlePreview}>
                  {pending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : docxMode ? (
                    <Sparkles className="mr-2 size-4" />
                  ) : (
                    <FileSpreadsheet className="mr-2 size-4" />
                  )}
                  {docxMode
                    ? t("employees.contractImport.extractContract")
                    : t("employees.contractImport.preview")}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | undefined;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-white px-5 py-4">
      <p className="text-xs text-gray-400">{label}</p>

      <p className={`mt-1 text-2xl font-bold ${color}`}>{value ?? 0}</p>
    </div>
  );
}
