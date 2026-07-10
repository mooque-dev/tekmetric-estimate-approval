import { useEstimate } from './hooks/useEstimate'
import AuthorizationSummary from './components/AuthorizationSummary'
import Confirmation from './components/Confirmation'
import StickyTotalBar from './components/StickyTotalBar'
import TriageSection from './components/TriageSection'
import TrustAnchor from './components/TrustAnchor'

export default function App() {
  const { state, dispatch, ledger, allAddressed, hasSignature, canAuthorize } = useEstimate()

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
        onStartOver={() => dispatch({ type: 'start-over' })}
      />
    )
  }

  return (
    <div className="min-h-dvh">
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
              sort={state.sort}
              onSort={(sort) => dispatch({ type: 'sort', sort })}
              onDecide={(id, decision) => dispatch({ type: 'decide', id, decision })}
            />
          </div>

          {/* Summary: inline in flow on mobile, sticky rail from tablet up. */}
          <aside className="mt-10 md:mt-0">
            <div className="md:sticky md:top-6 lg:top-8">
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
