import { downloadCsv } from "@/features/hr/shared/utils/export";

export function downloadUnitCsv(
  fileName: string,
  rows: Record<string, unknown>[],
) {
  if (rows.length === 0) {
    return;
  }

  const baseName = fileName.replace(/\.csv$/i, "");
  downloadCsv(baseName, rows);
}
