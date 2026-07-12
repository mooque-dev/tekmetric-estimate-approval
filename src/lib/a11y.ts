/** Small accessibility helpers shared across the variants. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scroll an element into view, honoring reduced-motion, and optionally move
 * keyboard focus to it (or a heading within it) so screen-reader and keyboard
 * users follow the same jump sighted users do. Use only for EXPLICIT user
 * actions (a "Next" button, a step change) — never on passive scroll-spy.
 */
export function scrollToEl(
  el: Element | null,
  opts: { block?: ScrollLogicalPosition; focus?: boolean } = {},
): void {
  if (!el) return
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'
  el.scrollIntoView({ behavior, block: opts.block ?? 'center' })
  if (opts.focus) {
    const target = (el.querySelector('h1, h2, h3, h4') as HTMLElement | null) ?? (el as HTMLElement)
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }
}

/** Move focus to an element (e.g. a view heading) after a state change. */
export function focusEl(el: HTMLElement | null): void {
  if (!el) return
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
