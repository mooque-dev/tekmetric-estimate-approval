import { useCallback } from 'react'
import { scrollToEl } from '../lib/a11y'
import { useEstimate } from '../hooks/useEstimate'
import { useScrollSpy } from '../hooks/useScrollSpy'
import AuthorizationSummary from '../components/AuthorizationSummary'
import Confirmation from '../components/Confirmation'
import StickyTotalBar from '../components/StickyTotalBar'
import TopBar, { SECTIONS } from '../components/TopBar'
import TriageSection from '../components/TriageSection'
import TrustAnchor from '../components/TrustAnchor'

const SECTION_IDS = SECTIONS.map((s) => s.id)

/**
 * Direction A — Editorial Ledger. One calm, typography-led scroll: services
 * grouped by urgency, a live ledger, sticky nav + section headers.
 *
 * Redundancy resolved: advancing is EXPLICIT only. After a decision the card
 * shows an optional note and a "Next item" button — there is no timed
 * auto-advance, so moving on is a single, predictable action.
 */
export default function EditorialApp() {
  const { state, dispatch, ledger, allAddressed, hasSignature, canAuthorize } = useEstimate()
  const { active, scrollToSection } = useScrollSpy(SECTION_IDS, 72)

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

  // Advance to the next item that needs attention — the next pending card, or
  // the summary when everything is decided. Triggered only by the explicit
  // "Next item" button on a decided card. Moves focus too, so keyboard and
  // screen-reader users are carried to the same place.
  const advanceFrom = useCallback((id: string) => {
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

    if (target) scrollToEl(target, { block: 'center', focus: true })
    else scrollToEl(document.getElementById('summary'), { block: 'start', focus: true })
  }, [])

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
      <TopBar active={active} onNavigate={scrollToSection} />
      <main id="main" tabIndex={-1} className="outline-none">
        <TrustAnchor />

        <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="gap-8 py-10 md:grid md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:py-14">
          <div className="min-w-0">
            <TriageSection
              decisions={state.decisions}
              comments={state.comments}
              sort={state.sort}
              allDecided={allAddressed}
              onSort={(sort) => dispatch({ type: 'sort', sort })}
              onDecide={(id, decision) => dispatch({ type: 'decide', id, decision })}
              onComment={(id, comment) => dispatch({ type: 'comment', id, comment })}
              onCommentFocus={() => {}}
              onNext={(id) => advanceFrom(id)}
            />
          </div>

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
      </main>

      <StickyTotalBar
        ledger={ledger}
        canAuthorize={canAuthorize}
        gateReason={gateReason}
        onAuthorize={() => dispatch({ type: 'authorize' })}
      />
    </div>
  )
}
