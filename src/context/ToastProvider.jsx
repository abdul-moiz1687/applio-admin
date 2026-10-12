import { useCallback, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { ToastContext } from './toastContext'

const TOAST_LIFETIME_MS = 4500

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (tone, message) => {
      nextId.current += 1
      const id = nextId.current
      setToasts((items) => [...items.slice(-2), { id, tone, message }])
      window.setTimeout(() => dismiss(id), TOAST_LIFETIME_MS)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.tone === 'success' ? CheckCircle2 : AlertTriangle
          return (
            <div key={toast.id} className={`toast toast-${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
              <Icon size={18} aria-hidden="true" />
              <span className="toast-message">{toast.message}</span>
              <button type="button" className="icon-btn toast-close" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
