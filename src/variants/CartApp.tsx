import { Toggle } from '@base-ui-components/react/toggle'
import { ToggleGroup } from '@base-ui-components/react/toggle-group'
import { services, shop, vehicle } from '../data/estimate'
import { useEstimate } from '../hooks/useEstimate'
import { money } from '../lib/format'
import type { Decision, Service } from '../types'
import AnimatedNumber from '../components/AnimatedNumber'
import Confirmation from '../components/Confirmation'
import SignaturePad from '../components/SignaturePad'

/**
 * Direction C — Itemized Receipt. Frames the estimate as an online cart: a
 * dense list you toggle in or out, beside a live receipt that recalculates
 * like adding and removing items. Leans on a shopping pattern everyone knows;
 * optimizes for speed and a strong "what am I paying for" read. No advancing —
 * everything is on one screen.
 */
export default function CartApp() {
  const { state, dispatch, ledger, canAuthorize, hasSignature, allAddressed } = useEstimate()

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
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-4 sm:px-8">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-approve text-[11px] font-semibold text-paper">
            IA
          </span>
          <p className="text-sm text-ink-soft">
            {shop.name} · {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-8 outline-none sm:px-8">
        <h1 className="sr-only">Your repair estimate</h1>
        <div className="gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Service list */}
          <section aria-labelledby="services-heading" className="min-w-0">
            <h2
              id="services-heading"
              className="text-xl font-semibold tracking-tight text-ink"
            >
              Recommended services
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Add what you’d like done. Your receipt updates as you go.
            </p>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {services.map((service) => (
                <CartRow
                  key={service.id}
                  service={service}
                  decision={state.decisions[service.id] ?? 'pending'}
                  comment={state.comments[service.id] ?? ''}
                  onDecide={(d) => dispatch({ type: 'decide', id: service.id, decision: d })}
                  onComment={(c) => dispatch({ type: 'comment', id: service.id, comment: c })}
                />
              ))}
            </ul>
          </section>

          {/* Receipt */}
          <aside aria-label="Order summary" className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-6">
              <Receipt
                ledger={ledger}
                decisions={state.decisions}
                allAddressed={allAddressed}
                hasSignature={hasSignature}
                canAuthorize={canAuthorize}
                resetKey={state.resetCount}
                onSign={(s) => dispatch({ type: 'sign', signature: s })}
                onAuthorize={() => dispatch({ type: 'authorize' })}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function CartRow({
  service,
  decision,
  comment,
  onDecide,
  onComment,
}: {
  service: Service
  decision: Decision
  comment: string
  onDecide: (d: Decision) => void
  onComment: (c: string) => void
}) {
  const approved = decision === 'approved'
  const declined = decision === 'declined'
  const critical = service.urgency === 'critical'

  return (
    <li className={`py-4 ${declined ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${critical ? 'bg-critical' : 'bg-ink-faint'}`}
              title={critical ? 'Critical' : 'Maintenance'}
            />
            <h3
              className={`font-semibold tracking-tight text-ink ${
                declined ? 'line-through decoration-ink-faint/60' : ''
              }`}
            >
              {service.title}
              <span className="sr-only">
                {' '}— {critical ? 'Critical safety item' : 'Preventative maintenance'}
              </span>
            </h3>
          </div>
          <p className="mt-1 line-clamp-2 max-w-prose text-sm leading-relaxed text-ink-soft">
            {service.why}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tnum font-semibold text-ink">{money(service.jobCost)}</p>
        </div>
      </div>

      {/* Add / Decline — Base UI ToggleGroup keeps all three states
          (pending = neither pressed); clicking the active one undoes it. */}
      <ToggleGroup
        value={decision === 'pending' ? [] : [decision]}
        onValueChange={(vals) => onDecide((vals[vals.length - 1] as Decision) ?? 'pending')}
        aria-label={`Add or decline ${service.title}`}
        className="mt-3 flex items-center gap-2"
      >
        <Toggle
          value="declined"
          className={(state) =>
            [
              'inline-flex min-h-[38px] items-center rounded-md border px-3.5 py-2 text-xs font-semibold transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ink/30',
              state.pressed
                ? 'border-ink bg-ink text-paper'
                : 'border-line-strong text-ink-soft hover:border-ink/60 hover:text-ink',
            ].join(' ')
          }
        >
          {declined ? '✕ Declined' : 'Decline'}
        </Toggle>
        <Toggle
          value="approved"
          className={(state) =>
            [
              'inline-flex min-h-[38px] items-center rounded-md border px-3.5 py-2 text-xs font-semibold transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-approve/40',
              state.pressed
                ? 'border-approve bg-approve text-paper'
                : 'border-line-strong text-approve hover:border-approve hover:bg-approve/[0.06]',
            ].join(' ')
          }
        >
          {approved ? '✓ Added to order' : 'Add to order'}
        </Toggle>
      </ToggleGroup>

      {decision !== 'pending' && (
        <input
          type="text"
          value={comment}
          onChange={(e) => onComment(e.target.value)}
          aria-label={
            declined
              ? `Reason for declining ${service.title} (optional)`
              : `Note for the shop about ${service.title} (optional)`
          }
          placeholder={declined ? 'Reason (optional)' : 'Note for the shop (optional)'}
          className="mt-2 w-full max-w-md rounded-md border border-line-strong bg-white/70 px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-approve focus-visible:ring-2 focus-visible:ring-approve/30"
        />
      )}
    </li>
  )
}

function Receipt({
  ledger,
  decisions,
  allAddressed,
  hasSignature,
  canAuthorize,
  resetKey,
  onSign,
  onAuthorize,
}: {
  ledger: ReturnType<typeof useEstimate>['ledger']
  decisions: Record<string, Decision>
  allAddressed: boolean
  hasSignature: boolean
  canAuthorize: boolean
  resetKey: number
  onSign: (s: string | null) => void
  onAuthorize: () => void
}) {
  const approved = services.filter((s) => decisions[s.id] === 'approved')
  const declined = services.filter((s) => decisions[s.id] === 'declined')

  const gate = canAuthorize
    ? null
    : !allAddressed
      ? `${ledger.pendingCount} item${ledger.pendingCount === 1 ? '' : 's'} still undecided`
      : ledger.approvedCount === 0
        ? 'Add at least one service'
        : !hasSignature
          ? 'Sign to authorize'
          : null

  return (
    <div className="rounded-lg border border-line bg-white/70 p-5 sm:p-6">
      <h2 className="text-center font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
        Your Order
      </h2>
      <p className="mt-1 text-center font-mono text-[12px] text-ink-faint">
        {shop.name} · RO #132582
      </p>
      <div className="my-4 border-t border-dashed border-line" />

      <dl className="space-y-2 font-mono text-[13px]">
        {approved.length === 0 && (
          <p className="text-ink-faint">— nothing added yet —</p>
        )}
        {approved.map((s) => (
          <div key={s.id} className="flex items-baseline justify-between gap-3">
            <dt className="min-w-0 truncate text-ink">{s.title}</dt>
            <dd className="tnum shrink-0 text-ink">{money(s.jobCost)}</dd>
          </div>
        ))}

        <div className="my-3 border-t border-dashed border-line" />
        <div className="flex justify-between text-ink-faint">
          <dt>Subtotal</dt>
          <dd className="tnum">{money(ledger.approvedJobs)}</dd>
        </div>
        <div className="flex justify-between text-ink-faint">
          <dt>Shop fee</dt>
          <dd className="tnum">{money(ledger.fees)}</dd>
        </div>
        <div className="flex justify-between text-ink-faint">
          <dt>Tax</dt>
          <dd className="tnum">{money(ledger.tax)}</dd>
        </div>
        <div className="my-3 border-t border-dashed border-line" />
        <div className="flex items-baseline justify-between">
          <dt className="text-base font-semibold text-ink">TOTAL</dt>
          <dd>
            <AnimatedNumber
              value={ledger.grandTotal}
              aria-hidden
              className="tnum text-xl font-bold text-ink"
            />
            <span className="sr-only" aria-live="polite">
              Total {money(ledger.grandTotal)}
            </span>
          </dd>
        </div>

        {declined.length > 0 && (
          <div className="mt-3 border-t border-dashed border-line pt-3 text-ink-faint">
            {declined.map((s) => (
              <div key={s.id} className="flex justify-between gap-3 text-[12px]">
                <span className="truncate line-through">{s.title}</span>
                <span className="tnum shrink-0">removed</span>
              </div>
            ))}
          </div>
        )}
      </dl>

      <div className="mt-5 border-t border-line pt-5">
        <SignaturePad key={resetKey} onChange={onSign} />
      </div>

      <button
        type="button"
        disabled={!canAuthorize}
        onClick={onAuthorize}
        className={[
          'mt-4 w-full rounded-lg px-5 py-3.5 text-[15px] font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-approve/40',
          canAuthorize
            ? 'bg-approve text-paper hover:bg-approve/90'
            : 'cursor-not-allowed bg-ink/[0.06] text-ink-faint',
        ].join(' ')}
      >
        {canAuthorize ? `Authorize & pay ${money(ledger.grandTotal)}` : 'Authorize work'}
      </button>
      <p role="status" className="mt-2.5 min-h-[1rem] text-center text-xs text-ink-soft">
        {gate ?? ''}
      </p>
    </div>
  )
}
