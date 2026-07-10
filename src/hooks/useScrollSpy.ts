import { useEffect, useRef, useState } from 'react'

/**
 * Tracks which section is currently in view for the top-nav scroll-spy.
 * Returns the id of the last section whose top has crossed above `offset`
 * (the app-bar height), and forces the final section when scrolled to bottom.
 *
 * A short "lock" after a programmatic scroll prevents the spy from fighting a
 * tab click mid-animation.
 */
export function useScrollSpy(ids: string[], offset: number) {
  const [active, setActive] = useState(ids[0])
  const lockUntil = useRef(0)

  useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      if (performance.now() < lockUntil.current) return
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top - offset <= 1) current = id
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) current = ids[ids.length - 1]
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|'), offset])

  /** Scroll to a section and briefly lock the spy so it doesn't flicker. */
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    lockUntil.current = performance.now() + 700
    setActive(id)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return { active, scrollToSection }
}
