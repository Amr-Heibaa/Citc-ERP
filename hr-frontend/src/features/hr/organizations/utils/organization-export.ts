import type { OrganizationSummary } from "@/lib/api/generated/model";

export function downloadOrganizationsCsv(organizations: OrganizationSummary[]) {
  const rows = organizations.map((organization) => ({
    Code: organization.code ?? "",
    "Name (EN)": organization.nameEn ?? "",
    "Name (AR)": organization.nameAr ?? "",
    Type: organization.type ?? "",
    Status: organization.status ?? "",
    Established: organization.establishedDate ?? "",
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
  link.download = `organizations-${new Date().toISOString().slice(0, 10)}.csv`;

  link.click();
  URL.revokeObjectURL(url);
}
