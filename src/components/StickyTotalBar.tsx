import { Progress } from '@base-ui-components/react/progress'
import { scrollToEl } from '../lib/a11y'
import type { Ledger } from '../lib/ledger'
import AnimatedNumber from './AnimatedNumber'

interface Props {
  ledger: Ledger
  canAuthorize: boolean
  gateReason: string | null
  onAuthorize: () => void
}

/**
 * Condensed total pinned to the bottom on mobile / tablet (hidden from md up,
 * where the sticky rail takes over). Shows the live total, a decision-progress
 * track, and a primary action that jumps to whatever is actually blocking:
 * the first undecided card, or the signature — or authorizes when ready.
 */
export default function StickyTotalBar({
  ledger,
  canAuthorize,
  gateReason,
  onAuthorize,
}: Props) {
  const total = ledger.approvedCount + ledger.declinedCount + ledger.pendingCount
  const decided = total - ledger.pendingCount

  const handleAction = () => {
    if (canAuthorize) {
      onAuthorize()
      return
    }
    // Jump to the real blocker: first undecided card, else the signature —
    // and move focus there so keyboard users follow.
    if (ledger.pendingCount > 0) {
      scrollToEl(document.querySelector('[data-decision="pending"]'), { focus: true })
    } else {
      scrollToEl(document.getElementById('summary'), { block: 'start', focus: true })
    }
  }

  const actionLabel = canAuthorize
    ? 'Authorize'
    : ledger.pendingCount > 0
      ? 'Review'
      : 'Sign'

  return (
    <div className="sticky bottom-0 z-20 border-t border-line bg-paper/95 shadow-bar backdrop-blur md:hidden">
      {/* Decision progress — a hairline that fills as cards are addressed. */}
      <Progress.Root value={decided} max={total} aria-label="Services reviewed">
        <Progress.Track className="h-0.5 w-full bg-ink/[0.06]">
          <Progress.Indicator className="h-full bg-accent/70 transition-all duration-500 ease-out" />
        </Progress.Track>
      </Progress.Root>

      <div
        className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="min-w-0">
          <p className="text-xs text-ink-faint">
            {ledger.pendingCount > 0
              ? `${ledger.pendingCount} left to review`
              : `${ledger.approvedCount} approved${ledger.declinedCount ? ` · ${ledger.declinedCount} declined` : ''}`}
          </p>
          {/* The inline summary owns the live total announcement, so this
              visible copy stays quiet to avoid double-speak on mobile. */}
          <AnimatedNumber
            value={ledger.grandTotal}
            className="tnum text-xl font-bold tracking-tight text-ink"
          />
        </div>
        <button
          type="button"
          onClick={handleAction}
          className={[
            'ml-auto min-h-[44px] shrink-0 rounded-md px-6 py-3 text-sm font-semibold transition-colors',
            canAuthorize ? 'bg-accent text-paper hover:bg-accent-soft' : 'bg-ink text-paper',
          ].join(' ')}
        >
          {actionLabel}
        </button>
      </div>
      {!canAuthorize && gateReason && (
        <p className="px-5 pb-2 text-center text-[11px] text-ink-faint sm:px-8">{gateReason}</p>
      )}
    </div>
  )
}
