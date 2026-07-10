import { services } from '../data/estimate'
import type { Ledger } from '../lib/ledger'
import { money } from '../lib/format'
import type { Decision } from '../types'
import AnimatedNumber from './AnimatedNumber'
import SignaturePad from './SignaturePad'

interface Props {
  ledger: Ledger
  decisions: Record<string, Decision>
  canAuthorize: boolean
  gateReason: string | null
  onSign: (signature: string | null) => void
  onAuthorize: () => void
  onReset: () => void
  /** Changes on start-over to force a fresh signature pad. */
  resetKey: number
}

/**
 * Zone 3 — Ledger & Authorization. A running summary that recalculates live,
 * the signature field, and the primary Authorize button. Reused inline on
 * mobile and inside the sticky desktop rail.
 */
export default function AuthorizationSummary({
  ledger,
  decisions,
  canAuthorize,
  gateReason,
  onSign,
  onAuthorize,
  onReset,
  resetKey,
}: Props) {
  const declined = services.filter((s) => decisions[s.id] === 'declined')

  const total = ledger.approvedCount + ledger.declinedCount + ledger.pendingCount
  const decided = total - ledger.pendingCount

  return (
    <div id="summary" className="scroll-mt-6 rounded-lg border border-line bg-white/60 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Your total</h2>
        <span className="tnum text-xs text-ink-faint">{decided} of {total} reviewed</span>
      </div>
      {/* Hairline progress of decisions made (approved + declined). */}
      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink/[0.07]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={decided}
        aria-label="Services reviewed"
      >
        <div
          className="h-full rounded-full bg-ink/60 transition-[width] duration-500 ease-out"
          style={{ width: `${total ? (decided / total) * 100 : 0}%` }}
        />
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <Row
          label={`Approved services${ledger.approvedCount ? ` (${ledger.approvedCount})` : ''}`}
          value={money(ledger.approvedJobs)}
        />

        {declined.map((s) => (
          <div
            key={s.id}
            className="flex items-baseline justify-between gap-4 text-ink-faint"
          >
            <dt className="line-through decoration-ink-faint/50">{s.title}</dt>
            <dd className="tnum shrink-0 line-through decoration-ink-faint/50">
              {money(s.jobCost)}
            </dd>
          </div>
        ))}
        {declined.length > 0 && (
          <p className="text-xs text-ink-faint">Declined items aren't included in your total.</p>
        )}

        <div className="border-t border-line pt-2.5">
          <Row label="Shop supplies fee" value={money(ledger.fees)} muted />
          <Row label="Sales tax" value={money(ledger.tax)} muted />
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt className="text-base font-semibold text-ink">Total</dt>
          <dd aria-live="polite">
            <AnimatedNumber
              value={ledger.grandTotal}
              className="tnum text-2xl font-bold tracking-tight text-ink"
            />
          </dd>
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
          'mt-4 w-full rounded-md px-5 py-3.5 text-[15px] font-semibold transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40',
          canAuthorize
            ? 'bg-accent text-paper hover:bg-accent-soft'
            : 'cursor-not-allowed bg-ink/[0.06] text-ink-faint',
        ].join(' ')}
      >
        {canAuthorize ? (
          <>Authorize Work — {money(ledger.grandTotal)}</>
        ) : (
          'Authorize Work'
        )}
      </button>

      {/* Surface WHY it's disabled. */}
      {gateReason && (
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-faint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="7.75" r="1.05" fill="currentColor" />
          </svg>
          {gateReason}
        </p>
      )}

      {decided > 0 && (
        <div className="mt-4 border-t border-line pt-3 text-center">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-ink-faint underline-offset-2 hover:text-ink-soft hover:underline"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={muted ? 'text-ink-faint' : 'text-ink-soft'}>{label}</dt>
      <dd className={`tnum shrink-0 ${muted ? 'text-ink-faint' : 'text-ink-soft'}`}>{value}</dd>
    </div>
  )
}
