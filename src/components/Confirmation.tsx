import { useEffect, useRef } from 'react'
import { customer, services, shop, vehicle } from '../data/estimate'
import type { Ledger } from '../lib/ledger'
import { money } from '../lib/format'
import { focusEl } from '../lib/a11y'
import type { Decision } from '../types'

interface Props {
  ledger: Ledger
  decisions: Record<string, Decision>
  comments: Record<string, string>
  onStartOver: () => void
}

/** Clean confirmation state shown after the customer authorizes the work. */
export default function Confirmation({ ledger, decisions, comments, onStartOver }: Props) {
  const approved = services.filter((s) => decisions[s.id] === 'approved')
  const declined = services.filter((s) => decisions[s.id] === 'declined')
  const note = (id: string) => comments[id]?.trim()

  // Moving from the estimate to this success view is a big context change —
  // pull focus to the heading so it's announced and keyboard focus isn't lost.
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    focusEl(headingRef.current)
  }, [])

  return (
    <main
      id="main"
      className="mx-auto max-w-xl animate-fade-up px-5 py-16 outline-none sm:px-8 sm:py-24"
    >
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

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-6 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink outline-none sm:text-4xl"
      >
        You're all set, {customer.name.split(' ')[0]}.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {shop.name} has received your authorization and will begin work on your {vehicle.year}{' '}
        {vehicle.make} {vehicle.model}. A copy of this estimate has been sent to your phone.
      </p>

      <div className="mt-9 rounded-lg border border-line bg-white/60 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-faint">Authorized work</p>
        <ul className="mt-3 space-y-2.5 text-sm">
          {approved.map((s) => (
            <li key={s.id}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-ink">{s.title}</span>
                <span className="tnum shrink-0 text-ink-soft">{money(s.jobCost)}</span>
              </div>
              {note(s.id) && (
                <p className="mt-0.5 text-xs italic text-ink-faint">“{note(s.id)}”</p>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <span className="text-base font-semibold text-ink">Total authorized</span>
          <span className="tnum text-2xl font-bold tracking-tight text-ink">
            {money(ledger.grandTotal)}
          </span>
        </div>

        {declined.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-faint">Not authorized</p>
            <ul className="mt-2 space-y-2 text-sm">
              {declined.map((s) => (
                <li key={s.id} className="text-ink-faint">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="line-through decoration-ink-faint/50">{s.title}</span>
                    <span className="tnum shrink-0 line-through decoration-ink-faint/50">
                      {money(s.jobCost)}
                    </span>
                  </div>
                  {note(s.id) && <p className="mt-0.5 text-xs italic">“{note(s.id)}”</p>}
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
