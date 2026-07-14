import { Tabs } from '@base-ui-components/react/tabs'
import { vehicle } from '../data/estimate'

export const SECTIONS = [
  { id: 'details', label: 'Details' },
  { id: 'services', label: 'Services' },
  { id: 'summary', label: 'Total' },
] as const

interface Props {
  active: string
  onNavigate: (id: string) => void
}

/**
 * Sticky top app bar: persistent context (whose car this is) that survives
 * scrolling, plus a section-jump nav (Base UI Tabs) driven by scroll-spy on
 * mobile / tablet. Review progress is intentionally NOT shown here — it lives
 * in the two places that own the total: the fixed bottom bar on mobile/tablet
 * ("X left to review") and the sticky ledger rail on desktop ("X of N
 * reviewed"). A third copy in the header was redundant.
 */
export default function TopBar({ active, onNavigate }: Props) {
  return (
    <header
      aria-label="Estimate navigation"
      className="sticky top-0 z-30 h-[var(--appbar-h)] border-b border-line bg-paper/90 backdrop-blur-md"
    >
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
          <Tabs.List
            aria-label="Jump to section"
            className="relative flex items-center justify-center gap-1"
          >
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
      </div>
    </header>
  )
}
