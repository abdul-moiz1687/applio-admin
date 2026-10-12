import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from './motion'

/**
 * Animates a number from its previous displayed value to `target`.
 * Always finishes on the exact `target` returned by the API. `null` means "no data yet".
 */
export function useCountUp(target, { enabled = true, duration = 0.9 } = {}) {
  const [display, setDisplay] = useState(typeof target === 'number' ? target : null)
  const lastValue = useRef(null)

  useLayoutEffect(() => {
    if (typeof target !== 'number' || !enabled || prefersReducedMotion()) {
      lastValue.current = typeof target === 'number' ? target : null
      setDisplay(typeof target === 'number' ? target : null)
      return undefined
    }

    const from = lastValue.current ?? 0
    const counter = { value: from }
    setDisplay(from)
    const tween = gsap.to(counter, {
      value: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(counter.value)),
      onComplete: () => {
        lastValue.current = target
        setDisplay(target)
      },
    })
    return () => {
      tween.kill()
    }
  }, [target, enabled, duration])

  return display
}
