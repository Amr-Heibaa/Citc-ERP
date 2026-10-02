import { getApiStatus } from "@/features/security/utils/security-errors";
import { SECURITY_DEFAULT_PAGE_SIZE } from "@/features/security/api/security-client";
import type { SecurityPage, SecurityPageParams } from "@/features/security/api/security-types";

/**
 * Retry once on network/5xx failures only. 4xx responses (forbidden,
 * not found, validation) and 501 (audit persistence disabled) are final.
 */
export function securityRetry(failureCount: number, error: unknown): boolean {
  const status = getApiStatus(error);
  if (status !== undefined && (status < 500 || status === 501)) return false;
  return failureCount < 1;
}

export function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Detail responses embed the first page of their nested collections. Use it
 * as initialData for the matching page-0 query; later pages (and refetches)
 * come from the dedicated nested endpoint.
 */
export function embeddedFirstPage<T>(
  params: SecurityPageParams,
  firstPage: SecurityPage<T> | undefined,
): SecurityPage<T> | undefined {
  if (!firstPage || (params.page ?? 0) !== 0) return undefined;
  return firstPage.size === (params.size ?? SECURITY_DEFAULT_PAGE_SIZE) ? firstPage : undefined;
}
