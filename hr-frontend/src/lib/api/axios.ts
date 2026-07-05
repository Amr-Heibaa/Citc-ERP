import Axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { normalizeApiError } from '@/lib/api/api-error'
import { useTokenStore } from '@/stores/token-store'

export const axiosInstance = Axios.create({
  baseURL: env.API_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = useTokenStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalizeApiError(error)),
)

type CancellablePromise<T> = Promise<T> & {
  cancel: () => void
}

export function customInstance<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): CancellablePromise<T> {
  const controller = new AbortController()

  const promise = axiosInstance({
    ...config,
    ...options,
    signal: controller.signal,
  }).then(({ data }) => data) as CancellablePromise<T>

  promise.cancel = () => controller.abort()

  return promise
}