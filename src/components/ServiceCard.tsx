import { useId } from 'react'
import type { Decision, Service } from '../types'
import { money } from '../lib/format'

interface Props {
  service: Service
  decision: Decision
  onDecide: (decision: Decision) => void
  /** Optional customer note (reason for declining / note on approving). */
  comment: string
  onComment: (value: string) => void
  /** Called when the note field gains focus, to cancel any pending auto-advance. */
  onCommentFocus?: () => void
  /** Advance to the next item that needs attention (or the summary when done). */
  onNext?: () => void
  /** True when no services remain pending — changes the Next label to "sign". */
  allDecided?: boolean
  /** Show the urgency label on the card (used when the list is flat-sorted,
      i.e. not grouped under an urgency header). */
  showUrgency?: boolean
}

const stateStyles: Record<Decision, string> = {
  pending: 'border-line',
  approved: 'border-approve/30 bg-approve/[0.035]',
  declined: 'border-line bg-transparent',
}

/**
 * One recommended service. Shows title, a plain-English "why", the itemized
 * labor + parts breakdown → job total, and side-by-side Decline / Approve
 * controls with three visibly distinct states.
 *
 * A declined card stays on the page but is de-emphasized and struck through,
 * so the customer sees what they turned down and can reverse it.
 */
export default function ServiceCard({
  service,
  decision,
  onDecide,
  comment,
  onComment,
  onCommentFocus,
  onNext,
  allDecided,
  showUrgency,
}: Props) {
  const declined = decision === 'declined'
  const approved = decision === 'approved'
  const critical = service.urgency === 'critical'
  const noteId = useId()

  return (
    <article
      id={`service-${service.id}`}
      data-decision={decision}
      className={[
        'scroll-mt-24 rounded-lg border px-5 py-5 transition-colors duration-300 sm:px-6',
        stateStyles[decision],
        declined ? 'opacity-70' : 'opacity-100',
      ].join(' ')}
    >
      {showUrgency && (
        <div className="mb-2 flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${critical ? 'bg-critical' : 'bg-ink-faint'}`}
          />
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              critical ? 'text-critical' : 'text-ink-faint'
            }`}
          >
            {critical ? 'Critical' : 'Maintenance'}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <h3
          className={[
            'text-lg font-semibold tracking-tight leading-snug text-ink',
            declined ? 'line-through decoration-ink-faint/60' : '',
          ].join(' ')}
        >
          {service.title}
        </h3>
        {/* key on decision so the badge replays its pop when the state changes */}
        <StateBadge key={decision} decision={decision} />
      </div>

      <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-soft">
        {service.why}
      </p>

      {/* Itemized breakdown — aligned columns: [kind chip] [label] [price] */}
      <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
        {service.lineItems.map((item) => (
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
            <dd className="tnum shrink-0 tabular-nums text-ink-soft">{money(item.amount)}</dd>
          </div>
        ))}
        <div className="mt-1 flex items-baseline gap-3 border-t border-line pt-3">
          <dt className="flex-1 text-[15px] font-semibold text-ink">Job total</dt>
          <dd
            className={[
              'tnum shrink-0 text-base font-semibold text-ink',
              declined ? 'line-through decoration-ink-faint/60' : '',
            ].join(' ')}
          >
            {money(service.jobCost)}
          </dd>
        </div>
      </dl>

      {/* Decision controls — Approve is the filled primary; Decline is the
          quieter secondary. The filled emphasis follows the active choice, so
          each card shows exactly one solid button. Titles explain tap-to-undo. */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-pressed={declined}
          title={declined ? 'Declined — tap to undo' : `Decline ${service.title}`}
          onClick={() => onDecide(declined ? 'pending' : 'declined')}
          className={[
            'flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink/30',
            declined
              ? 'border-ink bg-ink text-paper'
              : 'border-line bg-transparent text-ink-soft hover:border-ink/50 hover:bg-ink/[0.03] hover:text-ink',
          ].join(' ')}
        >
          {declined && <IconX />}
          {declined ? 'Declined' : 'Decline'}
        </button>
        <button
          type="button"
          aria-pressed={approved}
          title={approved ? 'Approved — tap to undo' : `Approve ${service.title}`}
          onClick={() => onDecide(approved ? 'pending' : 'approved')}
          className={[
            'flex min-h-[46px] items-center justify-center gap-1.5 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-approve/40',
            declined
              ? 'border-line bg-transparent text-ink-soft hover:border-approve hover:text-approve'
              : 'border-approve bg-approve text-paper shadow-sm hover:bg-approve/90',
          ].join(' ')}
        >
          {approved && <IconCheck />}
          {approved ? 'Approved' : 'Approve'}
        </button>
      </div>

      {/* Optional note — appears once a decision is made. Reason for a decline,
          or a note on an approval. Focusing it cancels any pending auto-advance,
          and "Next" is the explicit way to move on after writing a note. */}
      {decision !== 'pending' && (
        <div className="mt-3 animate-fade-up">
          <label htmlFor={noteId} className="text-xs font-medium text-ink-faint">
            {declined ? 'Reason for declining' : 'Add a note'}{' '}
            <span className="font-normal">(optional)</span>
          </label>
          <textarea
            id={noteId}
            value={comment}
            rows={2}
            onFocus={onCommentFocus}
            onChange={(e) => onComment(e.target.value)}
            placeholder={
              declined ? 'e.g. I’d like to wait until my next visit' : 'Anything the shop should know'
            }
            className="mt-1.5 w-full resize-none rounded-md border border-line bg-white/70 px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-accent"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              {allDecided ? 'Review & sign' : 'Next item'}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function StateBadge({ decision }: { decision: Decision }) {
  const base = 'mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium'
  if (decision === 'approved') {
    return <span className={`${base} animate-pop bg-approve/12 text-approve`}>✓ Approved</span>
  }
  if (decision === 'declined') {
    return (
      <span className={`${base} animate-pop border border-line text-ink-faint`}>Declined</span>
    )
  }
  return <span className={`${base} border border-line text-ink-faint`}>Pending</span>
}
