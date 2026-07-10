import { Progress } from '@base-ui-components/react/progress'
import { Tabs } from '@base-ui-components/react/tabs'
import { vehicle } from '../data/estimate'
import type { Ledger } from '../lib/ledger'

export const SECTIONS = [
  { id: 'details', label: 'Details' },
  { id: 'services', label: 'Services' },
  { id: 'summary', label: 'Total' },
] as const

interface Props {
  active: string
  onNavigate: (id: string) => void
  ledger: Ledger
}

/**
 * Sticky top app bar: persistent context (vehicle) that survives scrolling,
 * a section-jump nav (Base UI Tabs) driven by scroll-spy on mobile/tablet, and
 * a review-progress meter (Base UI Progress). Nav lives up top; the primary
 * total + Authorize action stays pinned to the bottom.
 */
type PipState = 'approved' | 'declined' | 'pending'

const pipClass: Record<PipState, string> = {
  approved: 'bg-approve',
  declined: 'bg-ink-faint',
  pending: 'bg-ink/15',
}

export default function TopBar({ active, onNavigate, ledger }: Props) {
  const total = ledger.approvedCount + ledger.declinedCount + ledger.pendingCount
  const decided = total - ledger.pendingCount

  // One pip per service, grouped approved → declined → pending.
  const pips: PipState[] = [
    ...Array<PipState>(ledger.approvedCount).fill('approved'),
    ...Array<PipState>(ledger.declinedCount).fill('declined'),
    ...Array<PipState>(ledger.pendingCount).fill('pending'),
  ]

  return (
    <header className="sticky top-0 z-30 h-[var(--appbar-h)] border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-8">
        {/* Persistent context — whose car this is */}
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-[11px] font-semibold tracking-tight text-paper"
          >
            IA
          </span>
          {/* Vehicle context appears where there's room; on phones the tabs
              take priority (the vehicle is shown in full in the Details section). */}
          <span className="hidden truncate text-[15px] font-medium text-ink sm:inline">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
        </div>

        {/* Section nav — mobile / tablet only (desktop shows both columns at once) */}
        <Tabs.Root
          value={active}
          onValueChange={(value) => onNavigate(String(value))}
          className="lg:hidden"
        >
          <Tabs.List className="relative flex items-center justify-center gap-1">
            {SECTIONS.map((s) => (
              <Tabs.Tab
                key={s.id}
                value={s.id}
                className={(state) =>
                  [
                    'cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors outline-none',
                    'focus-visible:ring-2 focus-visible:ring-ink/25',
                    state.active
                      ? 'font-semibold text-ink'
                      : 'font-medium text-ink-faint hover:text-ink-soft',
                  ].join(' ')
                }
              >
                {s.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator
              className="absolute -bottom-[1px] h-0.5 rounded-full bg-ink transition-all duration-300 ease-out"
              style={{
                left: 'var(--active-tab-left)',
                width: 'var(--active-tab-width)',
              }}
            />
          </Tabs.List>
        </Tabs.Root>

        {/* Review progress — one pip per service, coloured by state, so the bar
            shows how far along you are AND the approve/decline mix at a glance. */}
        <Progress.Root
          value={decided}
          max={total}
          className="ml-auto flex flex-none items-center gap-2"
          aria-label={`${decided} of ${total} services reviewed`}
        >
          <div
            className="flex items-center gap-1"
            aria-hidden
            title={`${ledger.approvedCount} approved · ${ledger.declinedCount} declined · ${ledger.pendingCount} left`}
          >
            {pips.map((s, i) => (
              <span
                key={i}
                className={`h-1.5 w-4 rounded-full transition-colors duration-300 ${pipClass[s]}`}
              />
            ))}
          </div>
          <span className="tnum whitespace-nowrap text-xs font-medium text-ink-faint">
            {decided}/{total}
          </span>
        </Progress.Root>
      </div>
    </header>
  )
}
