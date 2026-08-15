import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
  useConfirmContractImport,
  usePreviewContractImport,
} from "@/features/hr/api/use-employees";

type EmployeeContractImportDialogProps = {
  employeeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

function downloadTemplate() {
  const worksheet =
    XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      TEMPLATE_EXAMPLE,
    ]);

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

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Contracts",
  );

  XLSX.writeFile(
    workbook,
    "employee-contracts-template.xlsx",
  );
}

export function EmployeeContractImportDialog({
  employeeId,
  open,
  onOpenChange,
}: EmployeeContractImportDialogProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const previewMutation =
    usePreviewContractImport(employeeId);

  const confirmMutation =
    useConfirmContractImport(employeeId);

  const preview = previewMutation.data;
  const result = confirmMutation.data;

  const pending =
    previewMutation.isPending ||
    confirmMutation.isPending;

  function reset() {
    setFile(null);
    previewMutation.reset();
    confirmMutation.reset();
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
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
      toast.error(
        "Select an Excel file first",
      );
      return;
    }

    try {
      await previewMutation.mutateAsync(
        file,
      );

      toast.success(
        "Contract file validated",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to preview contracts",
      );
    }
  }

  async function handleConfirm() {
    if (!file || !preview) {
      return;
    }

    if (preview.validRows === 0) {
      toast.error(
        "The file has no valid contracts",
      );
      return;
    }

    try {
      const response =
        await confirmMutation.mutateAsync(
          file,
        );

      toast.success(
        `${response.importedRows} contracts imported`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to import contracts",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1200px, 96vw)",
          maxWidth: "none",
          height: "min(780px, 94vh)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl text-[#1a2535]">
            <FileSpreadsheet className="size-5 text-[#f5841f]" />
            Import Employee Contracts
          </DialogTitle>

          <DialogDescription>
            Download the template, add the
            contracts, then preview and confirm
            the import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-5">
          {!result && (
            <>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-[#f8f9fb] p-4 md:flex-row md:items-center">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Upload className="size-5 text-[#1a2535]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1a2535]">
                    Contracts Excel file
                  </p>

                  <p className="truncate text-xs text-gray-400">
                    {file
                      ? file.name
                      : "Select an .xlsx or .xls file"}
                  </p>
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  disabled={pending}
                  onChange={(event) => {
                    const selected =
                      event.target.files?.[0] ??
                      null;

                    setFile(selected);
                    previewMutation.reset();
                    confirmMutation.reset();
                  }}
                  className="block max-w-full text-sm text-gray-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#1a2535] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 size-4" />
                Download Excel Template
              </Button>
            </>
          )}

          {preview && !result && (
            <>
              <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Total"
                  value={preview.totalRows}
                  color="text-[#1a2535]"
                />

                <SummaryCard
                  label="Valid"
                  value={preview.validRows}
                  color="text-emerald-600"
                />

                <SummaryCard
                  label="Invalid"
                  value={preview.invalidRows}
                  color="text-red-600"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-auto rounded-xl border">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="sticky top-0 bg-[#f4f6f9] text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-3">
                        Row
                      </th>

                      <th className="px-4 py-3">
                        Contract Type
                      </th>

                      <th className="px-4 py-3">
                        Contract Number
                      </th>

                      <th className="px-4 py-3">
                        Start Date
                      </th>

                      <th className="px-4 py-3">
                        Work Type
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Message
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {preview.rows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className="border-t"
                      >
                        <td className="px-4 py-3 text-gray-500">
                          {row.rowNumber}
                        </td>

                        <td className="px-4 py-3">
                          {row.contractType || "—"}
                        </td>

                        <td className="px-4 py-3">
                          {row.contractNumber ||
                            "—"}
                        </td>

                        <td className="px-4 py-3">
                          {row.startDate || "—"}
                        </td>

                        <td className="px-4 py-3">
                          {row.fulltime == null
                            ? "—"
                            : row.fulltime
                              ? "Full Time"
                              : "Part Time"}
                        </td>

                        <td className="px-4 py-3">
                          {row.valid ? (
                            <Badge className="border-0 bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="mr-1 size-3" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge className="border-0 bg-red-100 text-red-700">
                              <XCircle className="mr-1 size-3" />
                              Invalid
                            </Badge>
                          )}
                        </td>

                        <td className="max-w-[320px] px-4 py-3 text-xs">
                          {row.errors.length > 0 && (
                            <p className="text-red-600">
                              {row.errors.join(", ")}
                            </p>
                          )}

                          {row.warnings.length >
                            0 && (
                            <p className="mt-1 flex items-start gap-1 text-amber-600">
                              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                              {row.warnings.join(
                                ", ",
                              )}
                            </p>
                          )}

                          {row.errors.length ===
                            0 &&
                            row.warnings.length ===
                              0 && (
                              <span className="text-gray-400">
                                Ready
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

          {result && (
            <>
              <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Total"
                  value={result.totalRows}
                  color="text-[#1a2535]"
                />

                <SummaryCard
                  label="Imported"
                  value={result.importedRows}
                  color="text-emerald-600"
                />

                <SummaryCard
                  label="Skipped"
                  value={result.skippedRows}
                  color="text-amber-600"
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                <CheckCircle2 className="size-5" />
                Contract import finished.
              </div>

              <div className="min-h-0 flex-1 overflow-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-[#f4f6f9] text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-3">
                        Row
                      </th>

                      <th className="px-4 py-3">
                        Contract Number
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>

                      <th className="px-4 py-3">
                        Message
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.rows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className="border-t"
                      >
                        <td className="px-4 py-3">
                          {row.rowNumber}
                        </td>

                        <td className="px-4 py-3">
                          {row.contractNumber ||
                            "—"}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            className={
                              row.status ===
                              "IMPORTED"
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
        </div>

        <DialogFooter className="shrink-0 border-t border-gray-100 px-6 py-4">
          {result ? (
            <Button
              type="button"
              onClick={() =>
                handleOpenChange(false)
              }
            >
              Done
            </Button>
          ) : preview ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  previewMutation.reset()
                }
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={
                  pending ||
                  preview.validRows === 0
                }
                onClick={handleConfirm}
              >
                {confirmMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}

                Confirm Import
              </Button>
            </>
          ) : (
            <Button
              type="button"
              disabled={!file || pending}
              onClick={handlePreview}
            >
              {previewMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 size-4" />
              )}

              Preview
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
    <div className="rounded-xl border bg-white px-5 py-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold ${color}`}
      >
        {value}
      </p>
    </div>
  );
}