import { useCallback, useRef } from 'react'
import { useEstimate } from './hooks/useEstimate'
import { useScrollSpy } from './hooks/useScrollSpy'
import type { Decision } from './types'
import AuthorizationSummary from './components/AuthorizationSummary'
import Confirmation from './components/Confirmation'
import StickyTotalBar from './components/StickyTotalBar'
import TopBar, { SECTIONS } from './components/TopBar'
import TriageSection from './components/TriageSection'
import TrustAnchor from './components/TrustAnchor'

const SECTION_IDS = SECTIONS.map((s) => s.id)

export default function App() {
  const { state, dispatch, ledger, allAddressed, hasSignature, canAuthorize } = useEstimate()
  // Scroll-spy for the top-nav; offset ≈ app-bar height (56px) + a little.
  const { active, scrollToSection } = useScrollSpy(SECTION_IDS, 72)

  // Auto-advance: after a decision, gently move to the next item that still
  // needs attention. The delay lets the state change register and — crucially —
  // is cancelled the moment the customer focuses the optional note field, so
  // adding a reason never gets interrupted.
  const advanceTimer = useRef<number | undefined>(undefined)
  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current)
      advanceTimer.current = undefined
    }
  }, [])

  const handleDecide = useCallback(
    (id: string, decision: Decision) => {
      dispatch({ type: 'decide', id, decision })
      cancelAdvance()
      if (decision === 'pending') return // undoing a decision shouldn't advance

      advanceTimer.current = window.setTimeout(() => {
        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-decision]'))
        const fromIdx = cards.findIndex((c) => c.id === `service-${id}`)
        let target: HTMLElement | null = null
        for (let i = fromIdx + 1; i < cards.length; i++) {
          if (cards[i].dataset.decision === 'pending') {
            target = cards[i]
            break
          }
        }
        if (!target) target = cards.find((c) => c.dataset.decision === 'pending') ?? null

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
        if (target) {
          const r = target.getBoundingClientRect()
          const fullyVisible = r.top >= 64 && r.bottom <= window.innerHeight
          if (!fullyVisible) target.scrollIntoView({ behavior, block: 'center' })
        } else {
          // Everything is decided — nudge toward the summary to sign.
          const summary = document.getElementById('summary')
          const r = summary?.getBoundingClientRect()
          const visible = r ? r.top >= 0 && r.top <= window.innerHeight * 0.6 : false
          if (summary && !visible) summary.scrollIntoView({ behavior, block: 'start' })
        }
      }, 900)
    },
    [dispatch, cancelAdvance],
  )

  // Explain WHY the authorize gate is closed (brief: always surface the reason).
  const gateReason = (() => {
    if (canAuthorize) return null
    if (!allAddressed) {
      const n = ledger.pendingCount
      return `${n} ${n === 1 ? 'service' : 'services'} still ${n === 1 ? 'needs' : 'need'} a decision`
    }
    if (ledger.approvedCount === 0) return 'You’ve declined every service — nothing to authorize'
    if (!hasSignature) return 'Add your signature to continue'
    return null
  })()

  if (state.authorized) {
    return (
      <Confirmation
        ledger={ledger}
        decisions={state.decisions}
        comments={state.comments}
        onStartOver={() => dispatch({ type: 'start-over' })}
      />
    )
  }

  return (
    <div className="min-h-dvh">
      <TopBar active={active} onNavigate={scrollToSection} ledger={ledger} />
      <TrustAnchor />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/*
          Responsive reflow:
          - mobile (<768): single column; summary inline, condensed total bar sticks to bottom.
          - tablet (md, 768+): two columns — services left, ledger promoted to a sticky rail.
          - desktop (lg, 1024+): same, with a wider rail and more generous gutters.
        */}
        <div className="gap-8 py-10 md:grid md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:py-14">
          <div className="min-w-0">
            <TriageSection
              decisions={state.decisions}
              comments={state.comments}
              sort={state.sort}
              onSort={(sort) => dispatch({ type: 'sort', sort })}
              onDecide={handleDecide}
              onComment={(id, comment) => dispatch({ type: 'comment', id, comment })}
              onCommentFocus={cancelAdvance}
            />
          </div>

          {/* Summary: inline in flow on mobile, sticky rail (below the app bar) from tablet up. */}
          <aside className="mt-10 md:mt-0">
            <div className="md:sticky md:top-[calc(var(--appbar-h)+1rem)]">
              <AuthorizationSummary
                ledger={ledger}
                decisions={state.decisions}
                canAuthorize={canAuthorize}
                gateReason={gateReason}
                onSign={(signature) => dispatch({ type: 'sign', signature })}
                onAuthorize={() => dispatch({ type: 'authorize' })}
                onReset={() => dispatch({ type: 'start-over' })}
                resetKey={state.resetCount}
              />
            </div>
          </aside>
        </div>
      </div>

      <StickyTotalBar
        ledger={ledger}
        canAuthorize={canAuthorize}
        gateReason={gateReason}
        onAuthorize={() => dispatch({ type: 'authorize' })}
      />
    </div>
  )
}
