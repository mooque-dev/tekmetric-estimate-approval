import { VARIANTS, type VariantId } from '../variants/registry'

/**
 * Demo-only chrome: a slim strip at the very top that lets a reviewer hop
 * between the three directions or return to the gallery. It sits in normal
 * flow (not sticky), so it scrolls away and each variant's own sticky
 * chrome behaves exactly as it would in production.
 */
export default function MetaSwitcher({ active }: { active: VariantId }) {
  return (
    <nav aria-label="Prototype design directions" className="border-b border-line bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-1.5 text-xs sm:gap-3 sm:px-8">
        <a
          href="#gallery"
          className="rounded px-1.5 py-1 font-medium text-paper/75 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/60"
        >
          ← Directions
        </a>
        <span aria-hidden className="text-paper/25">
          |
        </span>
        <span className="flex items-center gap-1">
          {VARIANTS.map((v) => (
            <a
              key={v.id}
              href={`#${v.id}`}
              aria-current={v.id === active ? 'page' : undefined}
              className={[
                'rounded px-2.5 py-1 font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/60',
                v.id === active ? 'bg-paper/15 text-paper' : 'text-paper/65 hover:text-paper',
              ].join(' ')}
            >
              {v.name}
            </a>
          ))}
        </span>
        <span className="ml-auto hidden text-paper/50 sm:inline">Prototype · design exploration</span>
      </div>
    </nav>
  )
}
