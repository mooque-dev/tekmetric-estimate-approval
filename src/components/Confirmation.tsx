import { customer, services, shop, vehicle } from '../data/estimate'
import type { Ledger } from '../lib/ledger'
import { money } from '../lib/format'
import type { Decision } from '../types'

interface Props {
  ledger: Ledger
  decisions: Record<string, Decision>
  onStartOver: () => void
}

/** Clean confirmation state shown after the customer authorizes the work. */
export default function Confirmation({ ledger, decisions, onStartOver }: Props) {
  const approved = services.filter((s) => decisions[s.id] === 'approved')
  const declined = services.filter((s) => decisions[s.id] === 'declined')

  return (
    <main className="mx-auto max-w-xl animate-fade-up px-5 py-16 sm:px-8 sm:py-24">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-approve/12 text-approve">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5l4.5 4.5L19 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mt-6 font-serif text-3xl leading-tight text-ink sm:text-4xl">
        You're all set, {customer.name.split(' ')[0]}.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {shop.name} has received your authorization and will begin work on your {vehicle.year}{' '}
        {vehicle.make} {vehicle.model}. A copy of this estimate has been sent to your phone.
      </p>

      <div className="mt-9 rounded-lg border border-line bg-white/60 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-faint">Authorized work</p>
        <ul className="mt-3 space-y-2 text-sm">
          {approved.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between gap-4">
              <span className="text-ink">{s.title}</span>
              <span className="tnum shrink-0 text-ink-soft">{money(s.jobCost)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <span className="font-serif text-lg text-ink">Total authorized</span>
          <span className="tnum font-serif text-2xl font-medium text-ink">
            {money(ledger.grandTotal)}
          </span>
        </div>

        {declined.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-faint">Not authorized</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {declined.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-4 text-ink-faint">
                  <span className="line-through decoration-ink-faint/50">{s.title}</span>
                  <span className="tnum shrink-0 line-through decoration-ink-faint/50">
                    {money(s.jobCost)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-faint">
              You can approve these later — just ask the shop or reopen your estimate link.
            </p>
          </div>
        )}

        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
          RO #{customer.repairOrder} · {shop.phone}
        </p>
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="mt-8 text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        ← Review the estimate again
      </button>
    </main>
  )
}
