import type { TFunction } from "i18next";

import { AppApiError } from "@/lib/api/api-error";

export function getApiStatus(error: unknown): number | undefined {
  return error instanceof AppApiError ? error.status : undefined;
}

/**
 * User-facing message for a failed Security request. 400/409 carry a
 * meaningful backend message (validation, duplicate code, protected
 * operation, last SYSTEM_ADMIN safeguard) and are shown as-is. 401 is
 * handled globally by the Axios interceptor (refresh, then logout).
 */
export function securityErrorMessage(error: unknown, t: TFunction, fallbackKey: string): string {
  const status = getApiStatus(error);
  const backendMessage =
    error instanceof Error && error.message && error.message !== "Something went wrong"
      ? error.message
      : undefined;

  switch (status) {
    case 403:
      return t("security.errors.forbidden");
    case 404:
      return t("security.errors.notFound");
    case 400:
    case 409:
      return backendMessage ?? t(fallbackKey);
    default:
      return backendMessage ?? t(fallbackKey);
  }
}
