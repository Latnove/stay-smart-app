import { useUserStore } from '@/entities/user'
import type { AuthResponse, ErrorResponse } from '@/shared/api'
import { client } from '@/shared/api/client.gen'
import { mapUser } from './apiMappers'

type ApiResult<TData> =
  | {
      data: TData
      error?: undefined
    }
  | {
      data?: undefined
      error: unknown
    }

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

let isApiConfigured = false
let refreshPromise: Promise<string | null> | null = null

type RetryOptions = {
  body?: unknown
  bodySerializer?: (body: unknown) => unknown
  credentials?: RequestCredentials
  integrity?: string
  keepalive?: boolean
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  serializedBody?: BodyInit | null
  signal?: AbortSignal | null
}

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise

  const refresh = async () => {
    try {
      const { clearUser, setAuth } = useUserStore.getState()

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        clearUser()
        return null
      }

      const auth = (await response.json()) as AuthResponse

      if (!auth.user || !auth.accessToken) {
        clearUser()
        return null
      }

      setAuth(mapUser(auth.user), auth.accessToken)
      return auth.accessToken
    } finally {
      refreshPromise = null
    }
  }

  refreshPromise = refresh()

  return refreshPromise
}

const getRetryBody = (options: RetryOptions): BodyInit | null | undefined => {
  if (options.body === undefined) return undefined
  if (options.serializedBody !== undefined) return options.serializedBody
  if (!options.bodySerializer) return options.body as BodyInit

  return options.bodySerializer(options.body) as BodyInit
}

export const configureApi = () => {
  client.setConfig({
    baseUrl: API_BASE_URL,
    credentials: 'include',
  })

  if (isApiConfigured) return

  client.interceptors.request.use((request) => {
    const token = useUserStore.getState().accessToken

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    return request
  })

  client.interceptors.response.use(async (response, request, options) => {
    if (response.status !== 401) return response
    if (request.headers.get('x-refresh-retry')) return response
    if (request.url.includes('/api/auth/refresh')) return response

    const accessToken = await refreshAccessToken()

    if (!accessToken) return response

    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    headers.set('x-refresh-retry', '1')

    const retryOptions = options as RetryOptions

    return fetch(
      new Request(request.url, {
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : getRetryBody(retryOptions),
        cache: request.cache,
        credentials: retryOptions.credentials ?? request.credentials ?? 'include',
        headers,
        integrity: retryOptions.integrity ?? request.integrity,
        keepalive: retryOptions.keepalive ?? request.keepalive,
        method: request.method,
        mode: retryOptions.mode ?? request.mode,
        redirect: retryOptions.redirect ?? request.redirect,
        referrer: retryOptions.referrer ?? request.referrer,
        referrerPolicy: retryOptions.referrerPolicy ?? request.referrerPolicy,
        signal: retryOptions.signal ?? undefined,
      }),
    )
  })

  isApiConfigured = true
}

export const getApiErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    const apiError = error as ErrorResponse

    if (apiError.errors && Object.keys(apiError.errors).length > 0) {
      return Object.values(apiError.errors).join('\n')
    }

    if (apiError.message) return apiError.message
  }

  return 'Что-то пошло не так'
}

export const unwrapApi = async <TData>(request: Promise<ApiResult<TData>>): Promise<NonNullable<TData>> => {
  const result = await request

  if (result.error) {
    throw new Error(getApiErrorMessage(result.error))
  }

  if (result.data === undefined) {
    throw new Error('Сервер вернул пустой ответ')
  }

  return result.data as NonNullable<TData>
}
