// Design directions explored for the estimate-approval challenge. All three
// share the SAME data, ledger math, and state model (src/data, src/lib,
// src/hooks) — they differ only in interaction model and presentation. The
// point is to compare how the same substance feels under different UX bets.

export type VariantId = 'editorial' | 'guided' | 'cart'

export interface VariantMeta {
  id: VariantId
  name: string
  tagline: string
  /** Why this direction — the design bet it makes. */
  reasoning: string
  bestFor: string
  tradeoff: string
  /** Accent hex for the gallery card. */
  accent: string
}

export const VARIANTS: VariantMeta[] = [
  {
    id: 'editorial',
    name: 'Editorial Ledger',
    tagline: 'One calm, typography-led scroll.',
    reasoning:
      'Treats the estimate like an editorial document: services grouped by urgency (Critical vs. Maintenance), a running ledger, and a sticky nav. Everything is visible in one continuous scroll, so the customer keeps the full picture — what’s wrong, what it costs, what they’ve decided — in view at all times. Bets that trust comes from transparency and overview.',
    bestFor: 'Desktop & tablet review; customers who want to see everything before committing.',
    tradeoff: 'More on screen at once; a long scroll on mobile.',
    accent: '#1f3a5f',
  },
  {
    id: 'guided',
    name: 'Guided Decisions',
    tagline: 'One recommendation at a time.',
    reasoning:
      'A stepped wizard: the customer sees a single service, decides, optionally leaves a note, and continues. Since the interaction IS moving forward, there’s no ambiguity about advancing — you address each safety item deliberately, one focused screen at a time. Bets that on a phone (the SMS context) focus and low cognitive load beat overview.',
    bestFor: 'Mobile-first; high-stakes decisions that deserve individual attention.',
    tradeoff: 'Less at-a-glance overview; more taps to reach the total.',
    accent: '#7a3b1f',
  },
  {
    id: 'cart',
    name: 'Itemized Receipt',
    tagline: 'A familiar cart you approve and pay.',
    reasoning:
      'Frames the estimate as an online cart / itemized receipt: a dense list of services you toggle in or out, beside a live receipt that recalculates like adding and removing items. Leans on a pattern everyone already knows from shopping, optimizing for speed and a strong sense of exactly what you’re paying for. Bets that commerce familiarity gets people to a confident decision fastest.',
    bestFor: 'Repeat customers; anyone who just wants to toggle and pay quickly.',
    tradeoff: 'Commerce framing can feel less advisory for a safety context.',
    accent: '#2f6b46',
  },
]

export const getVariant = (id: string): VariantMeta | undefined =>
  VARIANTS.find((v) => v.id === id)
