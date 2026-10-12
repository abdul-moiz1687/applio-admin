import axios from 'axios'

export const TOKEN_KEY = 'applioAdminToken'
export const USER_KEY = 'applioAdminUser'
export const SESSION_EXPIRED_EVENT = 'applio-admin:session-expired'

const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
  throw new Error('VITE_API_URL is not set. Copy .env.example to .env.')
}

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/** Normalised error thrown for every failed request. */
export class ApiError extends Error {
  constructor(message, { status = null, kind = 'server', data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.kind = kind // 'network' | 'unauthorized' | 'forbidden' | 'server' | 'validation'
    this.data = data
  }
}

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError('Cannot reach the APPLIO server. Check your connection and try again.', { kind: 'network' }),
      )
    }

    const { status, data } = error.response
    const serverMessage = data?.message || data?.error

    if (status === 401) {
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(USER_KEY)
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
      return Promise.reject(
        new ApiError(serverMessage || 'Your session has expired. Please sign in again.', { status, kind: 'unauthorized', data }),
      )
    }

    if (status === 403) {
      return Promise.reject(
        new ApiError(serverMessage || 'You do not have permission to perform this action.', { status, kind: 'forbidden', data }),
      )
    }

    if (status === 400 || status === 422) {
      return Promise.reject(
        new ApiError(serverMessage || 'The request was rejected. Check the form and try again.', { status, kind: 'validation', data }),
      )
    }

    return Promise.reject(
      new ApiError(serverMessage || `Server error (${status}). Please try again.`, { status, kind: 'server', data }),
    )
  },
)

/**
 * Centralised endpoint definitions.
 * VERIFIED = documented in the APPLIO master specification.
 * UNVERIFIED = not documented; confirm against the deployed backend before relying on it.
 */

export const endpoints = {
  auth: {
    login: '/auth/login',
  },

  users: {
    list: '/admin/users',
    remove: (id) => `/admin/users/${encodeURIComponent(id)}`,
  },

  appliances: {
    list: '/admin/appliances',
    detail: (id) => `/appliances/${encodeURIComponent(id)}`,
    qr: (id) => `/appliances/${encodeURIComponent(id)}/qr`,
  },

  services: {
    list: '/admin/services',
  },
}

export const authApi = {
  login: (email, password) => api.post(endpoints.auth.login, { email, password }).then((r) => r.data),
}

