import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { EASE, prefersReducedMotion } from './motion'

/**
 * Staggered entrance for elements matching `selector` inside `scopeRef`.
 * Runs once per mount (when `ready` first becomes true), never on later state updates.
 * Skipped entirely under prefers-reduced-motion, so content is always visible.
 */
export function useReveal(scopeRef, selector, ready = true) {
  const played = useRef(false)

  useLayoutEffect(() => {
    if (!ready || played.current || !scopeRef.current) return undefined
    played.current = true
    if (prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      gsap.from(selector, {
        opacity: 0,
        y: 12,
        duration: 0.45,
        ease: EASE,
        stagger: 0.05,
        clearProps: 'opacity,transform',
      })
    }, scopeRef.current)

    return () => ctx.revert()
  }, [scopeRef, selector, ready])
}
