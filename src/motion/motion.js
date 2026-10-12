import { gsap } from 'gsap'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

export const EASE = 'power2.out'

/** Clears any in-flight tween on an element by jumping to its end state, so nothing is left half-visible. */
export function settle(tween) {
  if (tween) tween.progress(1).kill()
}

export { gsap }
