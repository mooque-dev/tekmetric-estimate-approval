import { useState } from 'react'
import { customer, services, shop, vehicle } from '../data/estimate'
import { useEstimate } from '../hooks/useEstimate'
import { money } from '../lib/format'
import type { Decision } from '../types'
import AnimatedNumber from '../components/AnimatedNumber'
import Confirmation from '../components/Confirmation'
import SignaturePad from '../components/SignaturePad'

/**
 * Direction B — Guided Decisions. A stepped wizard: one service per screen,
 * decide → optional note → Continue. Advancing IS the interaction, so the
 * "how do we move on" question that dogged the scroll version simply doesn't
 * exist here. Mobile-first and deliberately low cognitive load.
 */
export default function WizardApp() {
  const { state, dispatch, ledger, canAuthorize, hasSignature } = useEstimate()
  const [step, setStep] = useState(0)

  const totalSteps = services.length + 1 // services + the review/sign step
  const onReview = step === services.length

  if (state.authorized) {
    return (
      <Confirmation
        ledger={ledger}
        decisions={state.decisions}
        comments={state.comments}
        onStartOver={() => {
          dispatch({ type: 'start-over' })
          setStep(0)
        }}
      />
    )
  }

  const service = services[step]
  const decision = service ? (state.decisions[service.id] ?? 'pending') : 'pending'

  return (
    <div className="min-h-dvh">
      {/* Compact context header + progress */}
      <header className="border-b border-line">
        <div className="mx-auto max-w-xl px-5 pt-6 pb-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-paper">
              IA
            </span>
            <p className="text-sm text-ink-soft">
              {shop.name} · {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i < step ? 'bg-accent' : i === step ? 'bg-accent/50' : 'bg-ink/10'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            {onReview ? 'Review & authorize' : `Service ${step + 1} of ${services.length}`}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 py-8 sm:px-6">
        {onReview ? (
          <ReviewStep
            ledger={ledger}
            decisions={state.decisions}
            hasSignature={hasSignature}
            canAuthorize={canAuthorize}
            resetKey={state.resetCount}
            onSign={(s) => dispatch({ type: 'sign', signature: s })}
            onBack={() => setStep(step - 1)}
            onAuthorize={() => dispatch({ type: 'authorize' })}
          />
        ) : (
          <ServiceStep
            key={service.id}
            decision={decision}
            comment={state.comments[service.id] ?? ''}
            onDecide={(d) => dispatch({ type: 'decide', id: service.id, decision: d })}
            onComment={(c) => dispatch({ type: 'comment', id: service.id, comment: c })}
            onBack={step > 0 ? () => setStep(step - 1) : undefined}
            onContinue={() => setStep(step + 1)}
            title={service.title}
            why={service.why}
            critical={service.urgency === 'critical'}
            concerns={customer.concerns}
            lineItems={service.lineItems}
            jobCost={service.jobCost}
          />
        )}
      </main>
    </div>
  )
}

function ServiceStep({
  decision,
  comment,
  onDecide,
  onComment,
  onBack,
  onContinue,
  title,
  why,
  critical,
  concerns,
  lineItems,
  jobCost,
}: {
  decision: Decision
  comment: string
  onDecide: (d: Decision) => void
  onComment: (c: string) => void
  onBack?: () => void
  onContinue: () => void
  title: string
  why: string
  critical: boolean
  concerns: string
  lineItems: { label: string; kind: string; detail?: string; amount: number }[]
  jobCost: number
}) {
  const decided = decision !== 'pending'
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${critical ? 'bg-critical' : 'bg-ink-faint'}`} />
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            critical ? 'text-critical' : 'text-ink-faint'
          }`}
        >
          {critical ? 'Critical — Safety & Performance' : 'Preventative Maintenance'}
        </span>
      </div>
      <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{why}</p>

      {critical && (
        <p className="mt-3 rounded-lg bg-ink/[0.03] px-4 py-3 text-sm leading-relaxed text-ink-soft">
          You told us: “{concerns}”
        </p>
      )}

      <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
        {lineItems.map((item) => (
          <div key={item.label} className="flex items-baseline gap-3">
            <dt className="flex min-w-0 flex-1 items-baseline gap-2.5">
              <span className="w-14 shrink-0 rounded bg-ink/[0.055] py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                {item.kind}
              </span>
              <span className="text-ink-soft">
                {item.label}
                {item.detail && <span className="text-ink-faint"> · {item.detail}</span>}
              </span>
            </dt>
            <dd className="tnum shrink-0 text-ink-soft">{money(item.amount)}</dd>
          </div>
        ))}
        <div className="flex items-baseline gap-3 border-t border-line pt-3">
          <dt className="flex-1 text-[15px] font-semibold text-ink">Job total</dt>
          <dd className="tnum text-base font-semibold text-ink">{money(jobCost)}</dd>
        </div>
      </dl>

      {/* Decision */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onDecide('declined')}
          className={[
            'min-h-[52px] rounded-lg border text-sm font-semibold transition-colors',
            decision === 'declined'
              ? 'border-ink bg-ink text-paper'
              : 'border-line text-ink-soft hover:border-ink/50 hover:text-ink',
          ].join(' ')}
        >
          {decision === 'declined' ? '✕ Declined' : 'Decline'}
        </button>
        <button
          type="button"
          onClick={() => onDecide('approved')}
          className={[
            'min-h-[52px] rounded-lg border text-sm font-semibold transition-colors',
            decision === 'approved'
              ? 'border-approve bg-approve text-paper'
              : 'border-approve bg-approve text-paper hover:bg-approve/90',
          ].join(' ')}
        >
          {decision === 'approved' ? '✓ Approved' : 'Approve'}
        </button>
      </div>

      {decided && (
        <div className="mt-3 animate-fade-up">
          <label className="text-xs font-medium text-ink-faint">
            {decision === 'declined' ? 'Reason for declining' : 'Add a note'}{' '}
            <span className="font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            rows={2}
            onChange={(e) => onComment(e.target.value)}
            placeholder={
              decision === 'declined' ? 'e.g. I’d like to wait' : 'Anything the shop should know'
            }
            className="mt-1.5 w-full resize-none rounded-md border border-line bg-white/70 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
        </div>
      )}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-ink-faint hover:text-ink"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={!decided}
          onClick={onContinue}
          className={[
            'rounded-lg px-6 py-3 text-sm font-semibold transition-colors',
            decided
              ? 'bg-accent text-paper hover:bg-accent-soft'
              : 'cursor-not-allowed bg-ink/[0.06] text-ink-faint',
          ].join(' ')}
        >
          Continue →
        </button>
      </div>
      {!decided && (
        <p className="mt-2 text-right text-xs text-ink-faint">Choose Approve or Decline to continue</p>
      )}
    </div>
  )
}

function ReviewStep({
  ledger,
  decisions,
  hasSignature,
  canAuthorize,
  resetKey,
  onSign,
  onBack,
  onAuthorize,
}: {
  ledger: ReturnType<typeof useEstimate>['ledger']
  decisions: Record<string, Decision>
  hasSignature: boolean
  canAuthorize: boolean
  resetKey: number
  onSign: (s: string | null) => void
  onBack: () => void
  onAuthorize: () => void
}) {
  const approved = services.filter((s) => decisions[s.id] === 'approved')
  const declined = services.filter((s) => decisions[s.id] === 'declined')

  return (
    <div className="animate-fade-up">
      <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">
        Review & authorize
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">Here’s your total based on your decisions.</p>

      <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
        {approved.map((s) => (
          <div key={s.id} className="flex items-baseline justify-between gap-4">
            <dt className="text-ink">{s.title}</dt>
            <dd className="tnum shrink-0 text-ink-soft">{money(s.jobCost)}</dd>
          </div>
        ))}
        {approved.length === 0 && (
          <p className="text-sm text-ink-faint">No services approved yet.</p>
        )}
        {declined.map((s) => (
          <div key={s.id} className="flex items-baseline justify-between gap-4 text-ink-faint">
            <dt className="line-through decoration-ink-faint/50">{s.title}</dt>
            <dd className="tnum shrink-0 line-through decoration-ink-faint/50">
              {money(s.jobCost)}
            </dd>
          </div>
        ))}
        <div className="mt-1 space-y-1 border-t border-line pt-2.5 text-ink-faint">
          <div className="flex justify-between gap-4">
            <span>Shop supplies fee</span>
            <span className="tnum">{money(ledger.fees)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Sales tax</span>
            <span className="tnum">{money(ledger.tax)}</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt className="text-base font-semibold text-ink">Total</dt>
          <AnimatedNumber
            value={ledger.grandTotal}
            className="tnum text-2xl font-bold tracking-tight text-ink"
          />
        </div>
      </dl>

      <div className="mt-6 border-t border-line pt-6">
        <SignaturePad key={resetKey} onChange={onSign} />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-faint">
        By signing, I authorize these jobs to be performed on my vehicle and agree to pay the
        total {money(ledger.grandTotal)} and accept the terms and conditions.
      </p>

      <button
        type="button"
        disabled={!canAuthorize}
        onClick={onAuthorize}
        className={[
          'mt-4 w-full rounded-lg px-5 py-3.5 text-[15px] font-semibold transition-colors',
          canAuthorize
            ? 'bg-accent text-paper hover:bg-accent-soft'
            : 'cursor-not-allowed bg-ink/[0.06] text-ink-faint',
        ].join(' ')}
      >
        {canAuthorize ? `Authorize Work — ${money(ledger.grandTotal)}` : 'Authorize Work'}
      </button>
      {!canAuthorize && (
        <p className="mt-2.5 text-center text-xs text-ink-faint">
          {ledger.approvedCount === 0
            ? 'Approve at least one service to authorize'
            : !hasSignature
              ? 'Add your signature to continue'
              : ''}
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-sm font-medium text-ink-faint hover:text-ink"
      >
        ← Back to services
      </button>
    </div>
  )
}
