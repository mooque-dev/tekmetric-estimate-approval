import { VARIANTS } from '../variants/registry'

/**
 * Landing page: presents the three design directions side by side with the
 * reasoning behind each, and links into them. Doubles as the written rationale
 * for the exploration.
 */
export default function Gallery() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
          Tekmetric · Estimate approval
        </p>
        <h1 className="mt-3 max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[38px]">
          Three directions for the same estimate.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          The same customer, the same three services, the same live ledger and $249.27 total — shown
          under three different UX bets. Pick one to try the full approve-decline-sign-authorize
          flow. All three share one data file, one ledger, and one state model; only the interaction
          and presentation change.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VARIANTS.map((v, i) => (
            <a
              key={v.id}
              href={`#${v.id}`}
              className="group flex flex-col rounded-xl border border-line bg-white/50 p-6 transition-colors hover:border-ink/25"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-paper"
                  style={{ backgroundColor: v.accent }}
                >
                  {i + 1}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-ink-faint">
                  Direction {String.fromCharCode(65 + i)}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">{v.name}</h2>
              <p className="mt-1 text-sm font-medium text-ink-soft">{v.tagline}</p>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
                {v.reasoning}
              </p>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[12.5px]">
                <div>
                  <dt className="inline font-semibold text-ink">Best for. </dt>
                  <dd className="inline text-ink-soft">{v.bestFor}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">Trade-off. </dt>
                  <dd className="inline text-ink-soft">{v.tradeoff}</dd>
                </div>
              </dl>
              <span
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-1.5"
                style={{ color: v.accent }}
              >
                Try this direction <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>

        <p className="mt-10 text-xs text-ink-faint">
          Note: each direction keeps its own state, so decisions reset when you switch. The prototype
          has no backend — everything is client-side.
        </p>
      </div>
    </div>
  )
}
