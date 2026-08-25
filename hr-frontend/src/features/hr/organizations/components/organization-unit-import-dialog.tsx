import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
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
  useConfirmOrganizationUnitImport,
  usePreviewOrganizationUnitImport,
} from "@/features/hr/organizations/api/use-organization-units";
import type {
  OrganizationUnitImportPreviewRow,
  OrganizationUnitImportResult,
  OrganizationUnitImportResultRow,
} from "@/lib/api/generated/model";

type OrganizationUnitImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: number;
};

type RowFilter = "ALL" | "ERRORS" | "WARNINGS";

export function OrganizationUnitImportDialog({
  open,
  onOpenChange,
  organizationId,
}: OrganizationUnitImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<RowFilter>("ALL");

  const previewMutation = usePreviewOrganizationUnitImport(organizationId);
  const confirmMutation = useConfirmOrganizationUnitImport(organizationId);

  const preview = previewMutation.data;
  const result = confirmMutation.data;

  const visiblePreviewRows = useMemo(() => {
    const rows = preview?.rows ?? [];

    if (filter === "ERRORS") {
      return rows.filter((row) => !row.valid);
    }

    if (filter === "WARNINGS") {
      return rows.filter((row) => (row.warnings?.length ?? 0) > 0);
    }

    return rows;
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
      toast.error("Select an Excel file first");
      return;
    }

    try {
      await previewMutation.mutateAsync(file);
      toast.success("Excel file validated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to preview the Excel file",
      );
    }
  }

  async function handleConfirm() {
    if (!file || !preview) {
      return;
    }

    try {
      const importResult = await confirmMutation.mutateAsync(file);

      if ((importResult.failedRows ?? 0) > 0) {
        toast.warning(
          `${importResult.importedRows ?? 0} imported, ${importResult.failedRows} failed`,
        );
      } else {
        toast.success(
          `${importResult.importedRows ?? 0} units imported successfully`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to import units",
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
            Import Organization Units
          </DialogTitle>

          <DialogDescription>
            Upload the organization structure Excel file, review validation
            results, then confirm the import.
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
                  Organization structure Excel file
                </p>

                <p className="truncate font-['Inter',sans-serif] text-xs text-gray-400">
                  {file
                    ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "Select an .xlsx or .xls file, maximum 10 MB"}
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
                  label="Total Rows"
                  value={preview.totalRows ?? 0}
                  color="text-[#1a2535]"
                />

                <SummaryCard
                  label="Valid"
                  value={preview.validRows ?? 0}
                  color="text-emerald-600"
                />

                <SummaryCard
                  label="Invalid"
                  value={preview.invalidRows ?? 0}
                  color="text-red-600"
                />

                <SummaryCard
                  label="With Warnings"
                  value={preview.rowsWithWarnings ?? 0}
                  color="text-amber-600"
                />
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <FilterButton
                  active={filter === "ALL"}
                  onClick={() => setFilter("ALL")}
                >
                  All ({preview.totalRows ?? 0})
                </FilterButton>

                <FilterButton
                  active={filter === "ERRORS"}
                  onClick={() => setFilter("ERRORS")}
                >
                  Errors ({preview.invalidRows ?? 0})
                </FilterButton>

                <FilterButton
                  active={filter === "WARNINGS"}
                  onClick={() => setFilter("WARNINGS")}
                >
                  Warnings ({preview.rowsWithWarnings ?? 0})
                </FilterButton>
              </div>

              <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[1150px]">
                  <thead className="sticky top-0 z-10 bg-[#f4f6f9]">
                    <tr>
                      {[
                        "Row",
                        "Unit",
                        "Type",
                        "Parent Unit",
                        "Start Date",
                        "Status",
                        "Messages",
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
                      <PreviewTableRow key={row.rowNumber} row={row} />
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
                  Select the organization structure workbook
                </p>

                <p className="mt-1 max-w-md text-sm text-gray-400">
                  The file will be validated first. No database changes occur
                  until you confirm the import.
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
            {result ? "Done" : "Cancel"}
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

              Preview File
            </Button>
          )}

          {preview && !result && (
            <Button
              disabled={(preview.validRows ?? 0) === 0 || confirmMutation.isPending}
              onClick={handleConfirm}
              className="bg-[#1a2535] text-white hover:bg-[#243347]"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}

              Import {preview.validRows ?? 0} Units
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewTableRow({ row }: { row: OrganizationUnitImportPreviewRow }) {
  return (
    <tr className="border-b border-gray-100 align-top">
      <td className="px-3 py-3 text-xs text-gray-400">{row.rowNumber}</td>

      <td className="px-3 py-3">
        <p className="text-sm font-medium text-[#1a2535]">
          {row.nameEn || "—"}
        </p>

        {row.nameAr && (
          <p dir="rtl" className="mt-0.5 text-left text-xs text-gray-400">
            {row.nameAr}
          </p>
        )}

        <p className="mt-0.5 text-xs text-gray-400">{row.code}</p>
      </td>

      <td className="px-3 py-3 text-xs text-gray-600">
        {row.unitType || "—"}

        {!row.unitTypeId && row.unitType && (
          <p className="mt-1 text-[11px] text-amber-600">Not matched</p>
        )}
      </td>

      <td className="px-3 py-3 text-xs text-gray-600">
        {row.parentUnitCode || "— (root unit)"}
      </td>

      <td className="px-3 py-3 text-xs text-gray-600">{row.startDate || "—"}</td>

      <td className="px-3 py-3">
        {row.valid ? (
          <Badge className="border-0 bg-emerald-100 text-emerald-700">
            <CheckCircle2 />
            Valid
          </Badge>
        ) : (
          <Badge className="border-0 bg-red-100 text-red-700">
            <XCircle />
            Invalid
          </Badge>
        )}
      </td>

      <td className="max-w-[330px] px-3 py-3">
        {row.errors?.map((message) => (
          <p key={`error-${message}`} className="mb-1 text-xs text-red-600">
            {message}
          </p>
        ))}

        {row.warnings?.map((message) => (
          <p key={`warning-${message}`} className="mb-1 text-xs text-amber-600">
            {message}
          </p>
        ))}

        {(row.errors?.length ?? 0) === 0 && (row.warnings?.length ?? 0) === 0 && (
          <span className="text-xs text-gray-400">Ready to import</span>
        )}
      </td>
    </tr>
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

function ImportResultView({ result }: { result: OrganizationUnitImportResult }) {
  return (
    <>
      <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total" value={result.totalRows ?? 0} color="text-[#1a2535]" />

        <SummaryCard
          label="Imported"
          value={result.importedRows ?? 0}
          color="text-emerald-600"
        />

        <SummaryCard
          label="Skipped"
          value={result.skippedRows ?? 0}
          color="text-amber-600"
        />

        <SummaryCard label="Failed" value={result.failedRows ?? 0} color="text-red-600" />
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle2 className="size-5 shrink-0" />
        The import finished. Imported units are now available in the
        organization structure.
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[800px]">
          <thead className="sticky top-0 bg-[#f4f6f9]">
            <tr>
              {["Row", "Unit Code", "Status", "Message"].map((heading) => (
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
            {result.rows?.map((row) => (
              <ResultTableRow key={`${row.rowNumber}-${row.code}`} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ResultTableRow({ row }: { row: OrganizationUnitImportResultRow }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3 text-xs text-gray-400">{row.rowNumber}</td>

      <td className="px-4 py-3 text-sm font-medium text-[#1a2535]">{row.code}</td>

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

      <td className="px-4 py-3 text-xs text-gray-500">{row.message || "—"}</td>
    </tr>
  );
}
