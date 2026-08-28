export type ExportRow = Record<string, unknown>;

function timestampedFileName(baseName: string, extension: string) {
  return `${baseName}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

function escapeCsvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function downloadCsv(baseName: string, rows: ExportRow[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvCell(row[header])).join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = timestampedFileName(baseName, "csv");
  link.click();
  URL.revokeObjectURL(url);
}

function columnWidths(rows: ExportRow[]) {
  if (rows.length === 0) return undefined;
  const headers = Object.keys(rows[0]);

  return headers.map((header) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, String(row[header] ?? "").length),
      header.length,
    );
    return { wch: Math.min(Math.max(longest + 2, 10), 40) };
  });
}

export async function downloadExcel(
  baseName: string,
  rows: ExportRow[],
  sheetName = "Sheet1",
) {
  const XLSX = await import("xlsx");

  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = columnWidths(rows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));

  XLSX.writeFile(workbook, timestampedFileName(baseName, "xlsx"));
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const REPORT_STYLES = `
  * { box-sizing: border-box; }

  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0 28px 28px;
    color: #1a2535;
  }

  .report-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 3px solid #f5841f;
    padding: 20px 0 14px;
    margin-bottom: 20px;
  }

  .report-brand {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #1a2535;
  }

  .report-meta {
    text-align: right;
    font-size: 11px;
    color: #6b7280;
  }

  h1 {
    margin: 0 0 4px;
    font-size: 20px;
  }

  .report-subtitle {
    margin: 0 0 20px;
    color: #6b7280;
    font-size: 13px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  th, td {
    border: 1px solid #e5e7eb;
    padding: 8px;
    text-align: left;
  }

  th {
    background: #1a2535;
    color: white;
  }

  tr:nth-child(even) td {
    background: #f4f6f9;
  }

  .report-footer {
    margin-top: 18px;
    font-size: 10px;
    color: #9ca3af;
    text-align: right;
  }

  @page {
    margin: 12mm;
  }

  @media print {
    .report-header { break-after: avoid; }
  }
`;

function reportShell(title: string, subtitle: string | undefined, bodyHtml: string, orientation: "portrait" | "landscape") {
  const generatedAt = new Date().toLocaleString();

  // The escaped "<\/script>" below is intentional: it keeps this template
  // literal from containing a literal "</script>" sequence, which could
  // otherwise prematurely close the surrounding <script> tag if this file
  // is ever bundled inline into an HTML document.
  /* eslint-disable no-useless-escape */
  return `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          ${REPORT_STYLES}
          @page { size: ${orientation}; margin: 12mm; }
        </style>
      </head>

      <body>
        <div class="report-header">
          <span class="report-brand">CITO</span>
          <span class="report-meta">Generated ${escapeHtml(generatedAt)}</span>
        </div>

        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="report-subtitle">${escapeHtml(subtitle)}</p>` : ""}

        ${bodyHtml}

        <div class="report-footer">CITC ERP — HR Module</div>

        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        <\/script>
      </body>
    </html>
  `;
  /* eslint-enable no-useless-escape */
}

function openPrintWindow(html: string) {
  const printWindow = window.open("", "_blank", "width=1100,height=750");

  if (!printWindow) {
    throw new Error("Allow pop-ups to export PDF");
  }

  printWindow.opener = null;
  printWindow.document.write(html);
  printWindow.document.close();
}

export function printTableReport(options: {
  title: string;
  subtitle?: string;
  rows: ExportRow[];
  orientation?: "portrait" | "landscape";
}) {
  const { title, subtitle, rows, orientation = "landscape" } = options;

  const headers = Object.keys(rows[0] ?? {});

  const headerHtml = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((header) => `<td>${escapeHtml(row[header])}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  const bodyHtml = `
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;

  openPrintWindow(reportShell(title, subtitle, bodyHtml, orientation));
}

export function printHtmlReport(options: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  orientation?: "portrait" | "landscape";
}) {
  const { title, subtitle, bodyHtml, orientation = "portrait" } = options;
  openPrintWindow(reportShell(title, subtitle, bodyHtml, orientation));
}
