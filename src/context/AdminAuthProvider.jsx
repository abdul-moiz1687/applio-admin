import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, authApi, SESSION_EXPIRED_EVENT, TOKEN_KEY, USER_KEY } from '../services/api'
import { AdminAuthContext } from './session'

export const ADMIN_ROLE = 'admin'

/** Decodes the JWT payload only to detect stale sessions. Signature checks stay on the backend. */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function readStoredSession() {
  const token = window.localStorage.getItem(TOKEN_KEY)
  const rawUser = window.localStorage.getItem(USER_KEY)
  if (!token || !rawUser) return null
  if (isTokenExpired(token)) {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    return null
  }
  try {
    const user = JSON.parse(rawUser)
    return user?.role === ADMIN_ROLE ? { token, user } : null
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [notice, setNotice] = useState(null)

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    const handleExpired = () => {
      setSession(null)
      setNotice('Your session has expired. Please sign in again.')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    setNotice(null)
    const data = await authApi.login(email, password)
    const user = data?.user
    if (!data?.token || !user) {
      throw new ApiError('Unexpected response from the server.', { kind: 'server' })
    }
    if (user.role !== ADMIN_ROLE) {
      // Never persist a non-admin session.
      throw new ApiError('This account does not have administrator access.', { kind: 'forbidden' })
    }
    window.localStorage.setItem(TOKEN_KEY, data.token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    setSession({ token: data.token, user })
    return user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setNotice('You have been signed out.')
  }, [clearSession])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      notice,
      clearNotice: () => setNotice(null),
      login,
      logout,
    }),
    [session, notice, login, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
