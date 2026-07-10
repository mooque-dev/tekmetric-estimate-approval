import { VARIANTS, type VariantId } from '../variants/registry'

/**
 * Demo-only chrome: a slim strip at the very top that lets a reviewer hop
 * between the three directions or return to the gallery. It sits in normal
 * flow (not sticky), so it scrolls away and each variant's own sticky
 * chrome behaves exactly as it would in production.
 */
export default function MetaSwitcher({ active }: { active: VariantId }) {
  return (
    <div className="border-b border-line bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-1.5 text-xs sm:px-8">
        <a href="#gallery" className="font-medium text-paper/70 hover:text-paper">
          ← Directions
        </a>
        <span className="text-paper/25">|</span>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => (
            <a
              key={v.id}
              href={`#${v.id}`}
              aria-current={v.id === active ? 'page' : undefined}
              className={[
                'rounded px-2.5 py-1 font-medium transition-colors',
                v.id === active ? 'bg-paper/15 text-paper' : 'text-paper/60 hover:text-paper',
              ].join(' ')}
            >
              {v.name}
            </a>
          ))}
        </nav>
        <span className="ml-auto hidden text-paper/40 sm:inline">Prototype · design exploration</span>
      </div>
    </div>
  )
}
