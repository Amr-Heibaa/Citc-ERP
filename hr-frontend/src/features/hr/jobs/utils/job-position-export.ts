import type { JobPositionSummary } from "@/lib/api/generated/model";

export function downloadJobPositionsCsv(positions: JobPositionSummary[]) {
  const rows = positions.map((position) => ({
    Code: position.code ?? "",
    "Title (EN)": position.titleEn ?? "",
    "Title (AR)": position.titleAr ?? "",
    Grade: position.gradeCode ?? "",
    Unit: position.orgUnitName ?? "",
    "Current Employee": position.assignedEmployeeName ?? "",
    Occupancy: position.occupancyStatus ?? "",
    Status: position.active ? "Active" : "Inactive",
  }));

  const headers = Object.keys(rows[0] ?? {});

  const escapeCell = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCell(row[header as keyof typeof row]))
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["﻿", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `job-positions-${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();
  URL.revokeObjectURL(url);
}
