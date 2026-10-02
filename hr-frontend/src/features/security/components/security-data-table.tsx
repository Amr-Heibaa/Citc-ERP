import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  ErrorState,
  NoMatchesState,
} from "@/features/security/components/security-states";
import { TABLE_HEAD_CLASS } from "@/features/security/components/tab-styles";

export type SecurityColumn<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

/**
 * Table with production loading / error / empty states. Rows are real
 * server rows only; the loading skeleton never renders fake records.
 */
export function SecurityDataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  isFiltered = false,
  minWidth = 720,
  footer,
  caption,
}: {
  columns: SecurityColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  emptyTitle: string;
  emptyDescription?: string;
  isFiltered?: boolean;
  minWidth?: number;
  footer?: ReactNode;
  caption?: string;
}) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  if (!isLoading && rows.length === 0) {
    return isFiltered ? (
      <NoMatchesState />
    ) : (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table style={{ minWidth }}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className="bg-[#f4f6f9]">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={`${TABLE_HEAD_CLASS} ${column.className ?? ""}`}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: 6 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={columns.length} className="py-2.5">
                      <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow key={getRowKey(row)} className="hover:bg-[#f5841f]/5">
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      {footer}
    </>
  );
}
