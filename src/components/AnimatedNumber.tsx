import { useEffect, useRef, useState } from 'react'
import { money } from '../lib/format'

interface Props {
  value: number
  className?: string
  /** ms */
  duration?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Counts the displayed value up/down toward `value` on change, so the ledger
 * total visibly recalculates. Renders formatted currency with tabular numerals
 * (via the `tnum` class on the caller) so digits don't jitter width.
 */
export default function AnimatedNumber({ value, className, duration = 550 }: Props) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number>()

  useEffect(() => {
    // Honor reduced-motion: snap instantly.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || fromRef.current === value) {
      fromRef.current = value
      setDisplay(value)
      return
    }

    const from = fromRef.current
    const delta = value - from
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = easeOutCubic(t)
      setDisplay(from + delta * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
        setDisplay(value)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = value
    }
  }, [value, duration])

  return <span className={className}>{money(display)}</span>
}
