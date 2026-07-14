import { services } from '../data/estimate'
import type { SortMode } from '../hooks/useEstimate'
import { isLongList } from '../lib/scale'
import type { Decision, Service, Urgency } from '../types'
import ServiceCard from './ServiceCard'
import SortControl from './SortControl'

interface Props {
  decisions: Record<string, Decision>
  comments: Record<string, string>
  sort: SortMode
  allDecided: boolean
  onSort: (mode: SortMode) => void
  onDecide: (id: string, decision: Decision) => void
  onComment: (id: string, value: string) => void
  onCommentFocus: () => void
  onNext: (id: string) => void
}

const groupMeta: Record<Urgency, { label: string; note: string; dot: string; rule: string }> = {
  critical: {
    label: 'Critical — Safety & Performance',
    note: 'Tied to what you reported. We recommend addressing these first.',
    dot: 'bg-critical',
    rule: 'border-critical/30',
  },
  maintenance: {
    label: 'Preventative Maintenance',
    note: 'Good to do soon to keep things running smoothly.',
    dot: 'bg-ink-faint',
    rule: 'border-line',
  },
}

const order: Record<SortMode, (a: Service, b: Service) => number> = {
  priority: () => 0, // keep curated/recommended order from the data file
  cost: (a, b) => b.jobCost - a.jobCost, // high → low
  az: (a, b) => a.title.localeCompare(b.title),
}

/**
 * Zone 2 — Triage. Services stay grouped by urgency (the critical vs.
 * maintenance distinction is core to the triage); the sort control reorders
 * cards within each group.
 */
export default function TriageSection({
  decisions,
  comments,
  sort,
  allDecided,
  onSort,
  onDecide,
  onComment,
  onCommentFocus,
  onNext,
}: Props) {
  const groups: Urgency[] = ['critical', 'maintenance']
  // Priority keeps the urgency grouping; Cost / A–Z collapse into one flat list
  // sorted across ALL services, so the sort visibly reorders the estimate.
  const grouped = sort === 'priority'
  // On a long list, re-sorting is a repeated action, so the control pins under
  // the app bar; the group headers then stack below the pinned sort row.
  const scaled = isLongList(services.length)
  const groupHeaderTop = scaled
    ? 'top-[calc(var(--appbar-h)+3.25rem)]'
    : 'top-[var(--appbar-h)]'

  return (
    <section
      id="services"
      aria-label="Recommended services"
      className="scroll-mt-[calc(var(--appbar-h)+0.75rem)]"
    >
      <div
        className={[
          'flex flex-wrap items-center justify-between gap-4',
          scaled
            ? 'sticky top-[var(--appbar-h)] z-20 -mx-5 border-b border-line bg-paper/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8'
            : '',
        ].join(' ')}
      >
        <h2 className="text-xl font-semibold tracking-tight text-ink">Recommended services</h2>
        <SortControl value={sort} onChange={onSort} />
      </div>

      {grouped ? (
        <div className="mt-8 space-y-10">
          {groups.map((urgency) => {
            const meta = groupMeta[urgency]
            const items = services.filter((s) => s.urgency === urgency)

            return (
              <div key={urgency}>
                {/* Sticky section header — pins under the app bar (below the
                    sort row when that's pinned too) while you're in this group,
                    then the next group's header takes over. */}
                <div
                  className={`sticky ${groupHeaderTop} z-10 flex items-baseline gap-3 border-b bg-paper/95 pt-3 pb-2.5 backdrop-blur ${meta.rule}`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 translate-y-[-1px] rounded-full ${meta.dot}`}
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-ink">
                    {meta.label}
                  </h3>
                  <span className="tnum ml-auto text-xs text-ink-faint">
                    {items.length} {items.length === 1 ? 'service' : 'services'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-soft">{meta.note}</p>

                <div className="mt-5 space-y-4">
                  {items.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      titleAs="h4"
                      decision={decisions[service.id] ?? 'pending'}
                      onDecide={(d) => onDecide(service.id, d)}
                      comment={comments[service.id] ?? ''}
                      onComment={(v) => onComment(service.id, v)}
                      onCommentFocus={onCommentFocus}
                      onNext={() => onNext(service.id)}
                      allDecided={allDecided}
                      collapsibleWhy={scaled}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-faint">
            {sort === 'cost' ? 'Sorted by cost, high to low' : 'Sorted A–Z'} · urgency shown on
            each service
          </p>
          {services
            .slice()
            .sort(order[sort])
            .map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                decision={decisions[service.id] ?? 'pending'}
                onDecide={(d) => onDecide(service.id, d)}
                comment={comments[service.id] ?? ''}
                onComment={(v) => onComment(service.id, v)}
                onCommentFocus={onCommentFocus}
                onNext={() => onNext(service.id)}
                allDecided={allDecided}
                showUrgency
                collapsibleWhy={scaled}
              />
            ))}
        </div>
      )}
    </section>
  )
}
