import type { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
  detail?: string;
  error?: string;
};

export class AppApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AppApiError";
    this.status = status;
  }
}

export function normalizeApiError(error: AxiosError<unknown>): AppApiError {
  const responseData = error.response?.data as ApiErrorResponse | undefined;

  if (error.message === "Network Error") {
    return new AppApiError("Unable to connect to the server");
  }

  if (error.code === "ECONNABORTED") {
    return new AppApiError("The request timed out");
  }

  if (error.code === "ERR_CANCELED") {
    return new AppApiError("The request was cancelled");
  }

  return new AppApiError(
    responseData?.message ??
      responseData?.detail ??
      responseData?.error ??
      "Something went wrong",
    error.response?.status,
  );
}