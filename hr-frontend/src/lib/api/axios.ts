import Axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/config/env'
import { normalizeApiError } from '@/lib/api/api-error'
import { clearAllQueriesCache } from '@/lib/api/query-client'
import { useTokenStore } from '@/stores/token-store'
import { useUserStore } from '@/stores/user-store'

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

// single in-flight refresh shared across all failed requests
let refreshPromise: Promise<string | null> | null = null

async function runRefresh(): Promise<string | null> {
  const refreshToken = useTokenStore.getState().refreshToken
  if (!refreshToken) return null
  try {
    const { data } = await axiosInstance.post(
      '/api/auth/refresh',
      { refreshToken },
      { _skipAuthRefresh: true } as AxiosRequestConfig,
    )
    useTokenStore.getState().setTokens(data.accessToken, data.refreshToken)
    return data.accessToken as string
  } catch {
    return null
  }
}

function forceLogout() {
  useTokenStore.getState().clearToken()
  useUserStore.getState().clearAuth()
  clearAllQueriesCache()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _skipAuthRefresh?: boolean })
      | undefined
    const status = error.response?.status

    if (status === 401 && original && !original._retry && !original._skipAuthRefresh) {
      original._retry = true
      if (!refreshPromise) {
        refreshPromise = runRefresh().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(original) // replay the original request
      }
      forceLogout()
    }

    return Promise.reject(normalizeApiError(error))
  },
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