import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs `loader` when `enabled` is true and exposes status, data and error.
 * `loader` must be a stable reference (module-level or wrapped in useCallback).
 * Previous data stays visible during a reload so tables do not flash empty.
 * `reload()` returns a promise resolving to { ok, error } once that load finishes, so callers can show feedback.
 */
export function useAsyncData(loader, enabled = true) {
  const [state, setState] = useState({ status: enabled ? 'loading' : 'idle', data: null, error: null })
  const [version, setVersion] = useState(0)
  const waiters = useRef([])

  useEffect(() => {
    if (!enabled || !loader) {
      setState({ status: 'idle', data: null, error: null })
      return undefined
    }
    let active = true
    const settle = (result) => {
      const pending = waiters.current.splice(0)
      pending.forEach((resolve) => resolve(result))
    }
    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    loader()
      .then((data) => {
        if (!active) return
        setState({ status: 'success', data, error: null })
        settle({ ok: true, error: null })
      })
      .catch((error) => {
        if (!active) return
        setState({ status: 'error', data: null, error })
        settle({ ok: false, error })
      })
    return () => {
      active = false
    }
  }, [loader, enabled, version])

  const reload = useCallback(
    () =>
      new Promise((resolve) => {
        waiters.current.push(resolve)
        setVersion((v) => v + 1)
      }),
    [],
  )

  return { ...state, reload }
}
