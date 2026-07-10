import { services } from '../data/estimate'
import type { SortMode } from '../hooks/useEstimate'
import type { Decision, Service, Urgency } from '../types'
import ServiceCard from './ServiceCard'
import SortControl from './SortControl'

interface Props {
  decisions: Record<string, Decision>
  sort: SortMode
  onSort: (mode: SortMode) => void
  onDecide: (id: string, decision: Decision) => void
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
export default function TriageSection({ decisions, sort, onSort, onDecide }: Props) {
  const groups: Urgency[] = ['critical', 'maintenance']

  return (
    <section aria-label="Recommended services">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-ink">Recommended services</h2>
        <SortControl value={sort} onChange={onSort} />
      </div>

      <div className="mt-8 space-y-10">
        {groups.map((urgency) => {
          const meta = groupMeta[urgency]
          const items = services
            .filter((s) => s.urgency === urgency)
            .slice()
            .sort(order[sort])

          return (
            <div key={urgency}>
              <div className={`flex items-baseline gap-3 border-b pb-2.5 ${meta.rule}`}>
                <span className={`h-2 w-2 shrink-0 translate-y-[-1px] rounded-full ${meta.dot}`} />
                <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-ink">
                  {meta.label}
                </h3>
                <span className="tnum ml-auto text-xs text-ink-faint">
                  {items.length} {items.length === 1 ? 'service' : 'services'}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-faint">{meta.note}</p>

              <div className="mt-5 space-y-4">
                {items.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    decision={decisions[service.id] ?? 'pending'}
                    onDecide={(d) => onDecide(service.id, d)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
