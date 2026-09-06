import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
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
import {
  useConfirmEmployeeImport,
  usePreviewEmployeeImport,
} from "@/features/hr/employees/api/use-employees";
import type { EmployeeImportResult } from "@/features/hr/employees/api/import-row-types";

type EmployeeImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type RowFilter = "ALL" | "ERRORS" | "WARNINGS";

export function EmployeeImportDialog({
  open,
  onOpenChange,
}: EmployeeImportDialogProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<RowFilter>("ALL");

  const previewMutation = usePreviewEmployeeImport();
  const confirmMutation = useConfirmEmployeeImport();

  const preview = previewMutation.data;
  const result = confirmMutation.data;

  const visiblePreviewRows = useMemo(() => {
    if (!preview) {
      return [];
    }

    if (filter === "ERRORS") {
      return preview.rows.filter((row) => !row.valid);
    }

    if (filter === "WARNINGS") {
      return preview.rows.filter((row) => row.warnings.length > 0);
    }

    return preview.rows;
  }, [filter, preview]);

  function resetDialog() {
    setFile(null);
    setFilter("ALL");
    previewMutation.reset();
    confirmMutation.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && (previewMutation.isPending || confirmMutation.isPending)) {
      return;
    }

    if (!nextOpen) {
      resetDialog();
    }

    onOpenChange(nextOpen);
  }

  async function handlePreview() {
    if (!file) {
      toast.error(t("employees.importDialog.selectFileFirst"));
      return;
    }

    try {
      await previewMutation.mutateAsync(file);
      toast.success(t("employees.importDialog.validatedSuccess"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.importDialog.unableToPreview"),
      );
    }
  }

  async function handleConfirm() {
    if (!file || !preview) {
      return;
    }

    try {
      const importResult = await confirmMutation.mutateAsync(file);

      if (importResult.failedRows > 0) {
        toast.warning(
          t("employees.importDialog.importedWithFailures", {
            imported: importResult.importedRows,
            failed: importResult.failedRows,
          }),
        );
      } else {
        toast.success(
          t("employees.importDialog.importedSuccess", { count: importResult.importedRows }),
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("employees.importDialog.unableToImport"),
      );
    }
  }

  const pending = previewMutation.isPending || confirmMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1400px, 96vw)",
          maxWidth: "none",
          height: "min(850px, 94vh)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl text-[#1a2535]">
            <FileSpreadsheet className="size-5 text-[#f5841f]" />
            {t("employees.importDialog.title")}
          </DialogTitle>

          <DialogDescription>
            {t("employees.importDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
          {!result && (
            <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fb] p-4 sm:flex-row sm:items-center">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Upload className="size-5 text-[#1a2535]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-['Inter',sans-serif] text-sm font-semibold text-[#1a2535]">
                  {t("employees.importDialog.fileLabel")}
                </p>

                <p className="truncate font-['Inter',sans-serif] text-xs text-gray-400">
                  {file
                    ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : t("employees.importDialog.selectFilePrompt")}
                </p>
              </div>

              <input
                type="file"
                accept=".xlsx,.xls"
                disabled={pending}
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;

                  setFile(selected);
                  setFilter("ALL");
                  previewMutation.reset();
                  confirmMutation.reset();
                }}
                className="block max-w-full text-sm text-gray-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#1a2535] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#243347]"
              />
            </div>
          )}

          {preview && !result && (
            <>
              <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
                <SummaryCard
                  label={t("employees.importDialog.summary.totalRows")}
                  value={preview.totalRows}
                  color="text-[#1a2535]"
                />

                <SummaryCard
                  label={t("employees.importDialog.summary.valid")}
                  value={preview.validRows}
                  color="text-emerald-600"
                />

                <SummaryCard
                  label={t("employees.importDialog.summary.invalid")}
                  value={preview.invalidRows}
                  color="text-red-600"
                />

                <SummaryCard
                  label={t("employees.importDialog.summary.withWarnings")}
                  value={preview.rowsWithWarnings}
                  color="text-amber-600"
                />
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <FilterButton
                  active={filter === "ALL"}
                  onClick={() => setFilter("ALL")}
                >
                  {t("employees.importDialog.filters.all", { count: preview.totalRows })}
                </FilterButton>

                <FilterButton
                  active={filter === "ERRORS"}
                  onClick={() => setFilter("ERRORS")}
                >
                  {t("employees.importDialog.filters.errors", { count: preview.invalidRows })}
                </FilterButton>

                <FilterButton
                  active={filter === "WARNINGS"}
                  onClick={() => setFilter("WARNINGS")}
                >
                  {t("employees.importDialog.filters.warnings", {
                    count: preview.rowsWithWarnings,
                  })}
                </FilterButton>
              </div>

              <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[1150px]">
                  <thead className="sticky top-0 z-10 bg-[#f4f6f9]">
                    <tr>
                      {[
                        t("employees.importDialog.previewTable.row"),
                        t("employees.importDialog.previewTable.employee"),
                        t("employees.importDialog.previewTable.nationalId"),
                        t("employees.importDialog.previewTable.department"),
                        t("employees.importDialog.previewTable.position"),
                        t("employees.importDialog.previewTable.contract"),
                        t("employees.importDialog.previewTable.status"),
                        t("employees.importDialog.previewTable.messages"),
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="border-b border-gray-200 px-3 py-3 text-left font-['Inter',sans-serif] text-xs font-semibold text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {visiblePreviewRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className="border-b border-gray-100 align-top"
                      >
                        <td className="px-3 py-3 text-xs text-gray-400">
                          {row.rowNumber}
                        </td>

                        <td className="px-3 py-3">
                          <p className="text-sm font-medium text-[#1a2535]">
                            {row.displayName}
                          </p>

                          <p dir="rtl" className="mt-0.5 text-left text-xs text-gray-400">
                            {row.arabicName}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {row.employeeNumber}
                          </p>
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {row.nationalId}
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {row.department || "—"}

                          {!row.orgUnitId && row.department && (
                            <p className="mt-1 text-[11px] text-amber-600">
                              {t("employees.importDialog.previewTable.notMatched")}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {row.positionTitle || "—"}

                          {!row.positionId && row.positionTitle && (
                            <p className="mt-1 text-[11px] text-amber-600">
                              {t("employees.importDialog.previewTable.notMatched")}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-3 text-xs text-gray-600">
                          {row.contractType || "—"}

                          {!row.contractTypeId && row.contractType && (
                            <p className="mt-1 text-[11px] text-amber-600">
                              {t("employees.importDialog.previewTable.notMatched")}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          {row.valid ? (
                            <Badge className="border-0 bg-emerald-100 text-emerald-700">
                              <CheckCircle2 />
                              {t("employees.importDialog.previewTable.valid")}
                            </Badge>
                          ) : (
                            <Badge className="border-0 bg-red-100 text-red-700">
                              <XCircle />
                              {t("employees.importDialog.previewTable.invalid")}
                            </Badge>
                          )}
                        </td>

                        <td className="max-w-[330px] px-3 py-3">
                          {row.errors.map((message) => (
                            <p key={`error-${message}`} className="mb-1 text-xs text-red-600">
                              {message}
                            </p>
                          ))}

                          {row.warnings.map((message) => (
                            <p key={`warning-${message}`} className="mb-1 text-xs text-amber-600">
                              {message}
                            </p>
                          ))}

                          {row.errors.length === 0 && row.warnings.length === 0 && (
                            <span className="text-xs text-gray-400">
                              {t("employees.importDialog.previewTable.readyToImport")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {result && <ImportResultView result={result} />}

          {!preview && !result && (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-orange-50">
                <FileSpreadsheet className="size-8 text-[#f5841f]" />
              </div>

              <div>
                <p className="font-semibold text-[#1a2535]">
                  {t("employees.importDialog.selectWorkbookTitle")}
                </p>

                <p className="mt-1 max-w-md text-sm text-gray-400">
                  {t("employees.importDialog.selectWorkbookDescription")}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => handleOpenChange(false)}
          >
            {result ? t("employees.importDialog.done") : t("employees.importDialog.cancel")}
          </Button>

          {!preview && !result && (
            <Button
              disabled={!file || previewMutation.isPending}
              onClick={handlePreview}
              className="bg-[#1a2535] text-white hover:bg-[#243347]"
            >
              {previewMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}

              {t("employees.importDialog.previewFile")}
            </Button>
          )}

          {preview && !result && (
            <Button
              disabled={preview.validRows === 0 || confirmMutation.isPending}
              onClick={handleConfirm}
              className="bg-[#1a2535] text-white hover:bg-[#243347]"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}

              {t("employees.importDialog.importNEmployees", { count: preview.validRows })}
            </Button>
          )}
        </DialogFooter>
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
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>

      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-[#1a2535] text-white" : "bg-[#f4f6f9] text-gray-500 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ImportResultView({ result }: { result: EmployeeImportResult }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label={t("employees.importDialog.summary.total")}
          value={result.totalRows}
          color="text-[#1a2535]"
        />

        <SummaryCard
          label={t("employees.importDialog.summary.imported")}
          value={result.importedRows}
          color="text-emerald-600"
        />

        <SummaryCard
          label={t("employees.importDialog.summary.skipped")}
          value={result.skippedRows}
          color="text-amber-600"
        />

        <SummaryCard
          label={t("employees.importDialog.summary.failed")}
          value={result.failedRows}
          color="text-red-600"
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle2 className="size-5 shrink-0" />
        {t("employees.importDialog.importFinishedNotice")}
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[800px]">
          <thead className="sticky top-0 bg-[#f4f6f9]">
            <tr>
              {[
                t("employees.importDialog.resultTable.row"),
                t("employees.importDialog.resultTable.employeeNumber"),
                t("employees.importDialog.resultTable.employee"),
                t("employees.importDialog.resultTable.status"),
                t("employees.importDialog.resultTable.message"),
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {result.rows.map((row) => (
              <tr
                key={`${row.rowNumber}-${row.employeeNumber}`}
                className="border-b border-gray-100"
              >
                <td className="px-4 py-3 text-xs text-gray-400">{row.rowNumber}</td>

                <td className="px-4 py-3 text-xs text-gray-600">
                  {row.employeeNumber}
                </td>

                <td className="px-4 py-3 text-sm font-medium text-[#1a2535]">
                  {row.displayName}
                </td>

                <td className="px-4 py-3">
                  <Badge
                    className={`border-0 ${
                      row.status === "IMPORTED"
                        ? "bg-emerald-100 text-emerald-700"
                        : row.status === "SKIPPED"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status === "FAILED" && <AlertTriangle />}
                    {row.status}
                  </Badge>
                </td>

                <td className="px-4 py-3 text-xs text-gray-500">
                  {row.message || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
