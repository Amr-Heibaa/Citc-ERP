import type { SecurityAuditLog, SecurityPage } from "@/features/security/api/security-types";
import { SecurityDataTable, type SecurityColumn } from "@/features/security/components/security-data-table";
import { SecurityPagination } from "@/features/security/components/security-pagination";
import {
  formatScalar,
  humanizeKey,
  isDisplayableKey,
  isScalar,
} from "@/features/security/utils/format";

const MAX_COLUMNS = 8;

/**
 * Renders audit rows, whose shape is not pinned by the Security contract,
 * using exactly the scalar fields the backend returns. Credential-like keys
 * are never displayed.
 */
function columnsFor(rows: SecurityAuditLog[]): SecurityColumn<SecurityAuditLog>[] {
  const keys: string[] = [];

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (!keys.includes(key) && isDisplayableKey(key) && isScalar(value)) keys.push(key);
    }
  }

  return keys.slice(0, MAX_COLUMNS).map((key) => ({
    key,
    header: humanizeKey(key),
    className: "font-['Inter',sans-serif] text-sm text-gray-600 whitespace-nowrap",
    cell: (row) => formatScalar(row[key]),
  }));
}

export function AuditRecordsTable({
  data,
  isLoading,
  isFetching,
  error,
  onRetry,
  onPageChange,
  emptyTitle,
  emptyDescription,
  caption,
}: {
  data: SecurityPage<SecurityAuditLog> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  emptyDescription?: string;
  caption: string;
}) {
  const rows = data?.content ?? [];

  return (
    <SecurityDataTable
      columns={columnsFor(rows)}
      rows={rows}
      getRowKey={(row) => JSON.stringify(row)}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      caption={caption}
      footer={
        data && (
          <SecurityPagination
            page={data.page}
            size={data.size}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={onPageChange}
            disabled={isFetching}
          />
        )
      }
    />
  );
}
