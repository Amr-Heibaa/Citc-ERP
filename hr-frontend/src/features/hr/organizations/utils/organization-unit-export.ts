function escapeCsvValue(
  value: unknown,
): string {
  const normalized =
    value == null
      ? ""
      : String(value);

  return `"${normalized.replace(
    /"/g,
    '""',
  )}"`;
}

export function downloadUnitCsv(
  fileName: string,
  rows: Record<string, unknown>[],
) {
  if (rows.length === 0) {
    return;
  }

  const headers =
    Object.keys(rows[0]);

  const csv = [
    headers
      .map(escapeCsvValue)
      .join(","),

    ...rows.map((row) =>
      headers
        .map((header) =>
          escapeCsvValue(
            row[header],
          ),
        )
        .join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(
    ["\uFEFF", csv],
    {
      type: "text/csv;charset=utf-8",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}