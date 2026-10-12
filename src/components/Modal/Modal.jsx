import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { EASE, prefersReducedMotion, settle } from '../../motion/motion'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  open,
  onClose,
  labelledBy,
  role = 'dialog',
  size = 'md',
  busy = false,
  initialFocusRef,
  children,
}) {
  const backdropRef = useRef(null)
  const panelRef = useRef(null)
  const returnFocusRef = useRef(null)

  // Enter animation, scroll lock, and focus management. Everything is undone on close.
  useLayoutEffect(() => {
    if (!open) return undefined
    returnFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const tweens = []
    if (!prefersReducedMotion()) {
      tweens.push(gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' }))
      tweens.push(
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 14, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: EASE, clearProps: 'transform' },
        ),
      )
    }

    const target = initialFocusRef?.current ?? panelRef.current?.querySelector(FOCUSABLE)
    target?.focus()

    return () => {
      tweens.forEach(settle)
      document.body.style.overflow = previousOverflow
      returnFocusRef.current?.focus?.()
    }
  }, [open, initialFocusRef])

  // Escape closes (unless busy); Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape' && !busy) {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)]
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onClose()
      }}
    >
      <div ref={panelRef} className={`modal modal-${size}`} role={role} aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  )
}
