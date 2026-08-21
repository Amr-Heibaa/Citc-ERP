/**
 * TEMPORARY WORKAROUND — not orval output, kept in sync by hand.
 *
 * The backend's OpenAPI spec incorrectly shares a single `RowResult`
 * schema component across several unrelated Java DTOs:
 *  - EmployeeImportPreview.rows uses it (wrongly — the real shape is
 *    EmployeeImportPreviewRow below, not the contract-preview shape).
 *  - EmployeeImportResult.rows uses it (wrongly — real shape is
 *    EmployeeImportResultRow below).
 *  - ContractImportResult.rows uses it (wrongly — the confirm endpoint
 *    actually returns ContractImportResultRow below, with
 *    status/message/contractId; RowResult has none of those).
 *  - ContractImportPreview.rows is the only one that's actually
 *    correct against the generated RowResult type.
 *
 * This is almost certainly several distinct Java classes that all
 * happen to be named `RowResult` in different outer classes, which
 * springdoc collapsed into one shared `#/components/schemas/RowResult`.
 *
 * Once the backend gives each DTO a distinct `@Schema` name (e.g.
 * EmployeeImportPreviewRow / EmployeeImportResultRow /
 * ContractImportResultRow) and the client is regenerated, delete this
 * file and the casts in use-employees.ts that reference it.
 */

export type EmployeeImportPreviewRow = {
  rowNumber: number;
  employeeNumber: string;
  displayName: string;
  arabicName: string;
  nationalId: string;
  department: string;
  orgUnitId: number | null;
  positionTitle: string;
  positionId: number | null;
  contractType: string;
  contractTypeId: number | null;
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type EmployeeImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rowsWithWarnings: number;
  rows: EmployeeImportPreviewRow[];
};

export type EmployeeImportResultRow = {
  rowNumber: number;
  employeeNumber: string;
  displayName: string;
  employeeId: number | null;
  status: "IMPORTED" | "SKIPPED" | "FAILED";
  message: string | null;
};

export type EmployeeImportResult = {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  rows: EmployeeImportResultRow[];
};

export type ContractImportResultRow = {
  rowNumber: number;
  contractNumber: string | null;
  contractId: number | null;
  status: string;
  message: string | null;
};

export type ContractImportResult = {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  rows: ContractImportResultRow[];
};
