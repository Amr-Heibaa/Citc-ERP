import type { AxiosError } from 'axios'

type ApiErrorResponse = {
  message?: string
}

export type AppApiError = {
  message: string
  status?: number
}

export function normalizeApiError(error: AxiosError<unknown>): AppApiError {
  const responseData = error.response?.data as ApiErrorResponse | undefined

  if (error.message === 'Network Error') {
    return { message: 'Unable to connect to the server' }
  }
  if (error.code === 'ECONNABORTED') {
    return { message: 'The request timed out' }
  }
  if (error.code === 'ERR_CANCELED') {
    return { message: 'The request was cancelled' }
  }

  return {
    message: responseData?.message ?? 'Something went wrong',
    status: error.response?.status,
  }
}