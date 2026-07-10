import { Toggle } from '@base-ui-components/react/toggle'
import { ToggleGroup } from '@base-ui-components/react/toggle-group'
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

/** Segmented sort control (Base UI ToggleGroup). Reorders cards within groups. */
export default function SortControl({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs uppercase tracking-[0.12em] text-ink-faint">Sort</span>
      <ToggleGroup
        value={[value]}
        onValueChange={(groupValue) => {
          // Single-select: ignore a deselect (empty), otherwise take the new value.
          const next = groupValue[groupValue.length - 1] as SortMode | undefined
          if (next) onChange(next)
        }}
        aria-label="Sort services"
        className="inline-flex rounded-md border border-line p-0.5"
      >
        {options.map((opt) => (
          <Toggle
            key={opt.id}
            value={opt.id}
            className={(state) =>
              [
                'cursor-pointer rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ink/25',
                state.pressed ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink',
              ].join(' ')
            }
          >
            {opt.label}
          </Toggle>
        ))}
      </ToggleGroup>
    </div>
  )
}
