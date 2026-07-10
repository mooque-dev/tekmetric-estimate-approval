import { customer, shop, vehicle } from '../data/estimate'

/**
 * Zone 1 — Trust Anchor. Grounds the customer in their own words (shop,
 * vehicle, and their reported concerns echoed back verbatim) before any
 * money appears.
 */
export default function TrustAnchor() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-7 sm:px-8 lg:pt-12">
        {/* Shop identity */}
        <div className="flex items-start justify-between gap-x-6 gap-y-1">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent font-serif text-sm text-paper"
            >
              IA
            </span>
            <div>
              <p className="font-serif text-lg leading-tight text-ink">{shop.name}</p>
              <p className="text-sm text-ink-faint">
                {shop.address} · {shop.phone}
              </p>
            </div>
          </div>
          <p className="shrink-0 whitespace-nowrap pt-0.5 text-sm text-ink-faint">
            RO<span className="text-ink-faint/70"> #</span>
            <span className="tnum text-ink-soft">{customer.repairOrder}</span>
          </p>
        </div>

        {/* Headline */}
        <h1 className="mt-8 max-w-2xl font-serif text-3xl leading-tight text-ink sm:text-4xl">
          Hi {customer.name.split(' ')[0]} — here's your estimate to review.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Approve or decline each recommended service below, then sign to authorize the work.
          Work begins only once you authorize.
        </p>

        {/* Vehicle + concerns */}
        <div className="mt-9 grid gap-x-10 gap-y-8 border-t border-line pt-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">Your vehicle</p>
            <p className="mt-2 font-serif text-xl text-ink">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            <dl className="mt-3 space-y-1 text-sm text-ink-soft">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-faint">Color</dt>
                <dd>{vehicle.color}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-faint">Plate</dt>
                <dd className="tnum">{vehicle.plate}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-faint">VIN</dt>
                <dd className="tnum break-all">{vehicle.vin}</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint">
              What you told us
            </p>
            <blockquote className="mt-2 border-l-2 border-critical/40 pl-4 font-serif text-lg italic leading-relaxed text-ink">
              “{customer.concerns}”
            </blockquote>
          </div>
        </div>
      </div>
    </header>
  )
}
