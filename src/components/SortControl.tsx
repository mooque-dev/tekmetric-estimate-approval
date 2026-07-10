import type { SortMode } from '../hooks/useEstimate'

interface Props {
  value: SortMode
  onChange: (mode: SortMode) => void
}

const options: { id: SortMode; label: string }[] = [
  { id: 'priority', label: 'Priority' },
  { id: 'cost', label: 'Cost' },
  { id: 'az', label: 'A–Z' },
]

/** Segmented sort control. Reorders cards within each urgency group. */
export default function SortControl({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-[0.12em] text-ink-faint">Sort</span>
      <div
        role="radiogroup"
        aria-label="Sort services"
        className="inline-flex rounded-md border border-line p-0.5"
      >
        {options.map((opt) => {
          const active = value === opt.id
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={active}
              type="button"
              onClick={() => onChange(opt.id)}
              className={[
                'rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
