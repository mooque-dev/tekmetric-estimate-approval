import { FEE_RATE, TAX_RATE, services } from '../data/estimate'
import type { Decision } from '../types'
import { round2 } from './format'

export interface Ledger {
  /** Sum of approved jobs' cost (labor + parts). */
  approvedJobs: number
  /** Sum of declined jobs' cost — shown struck through, NOT in the payable total. */
  declinedJobs: number
  /** Proportional shop fee on approved jobs. */
  fees: number
  /** approvedJobs + fees */
  subtotal: number
  /** Proportional sales tax on the subtotal. */
  tax: number
  /** The payable total. */
  grandTotal: number
  approvedCount: number
  declinedCount: number
  pendingCount: number
}

/**
 * Recompute the whole ledger from the current per-service decisions.
 *
 * Fees and tax scale with the approved jobs (rates derived from the PDF's
 * all-approved snapshot in src/data/estimate.ts), so:
 *   - all three approved  → exactly $224.55 / $15.78 / $240.33 / $8.94 / $249.27
 *   - any job declined    → its cost leaves the payable total; fees + tax rescale
 */
export function computeLedger(decisions: Record<string, Decision>): Ledger {
  let approvedJobs = 0
  let declinedJobs = 0
  let approvedCount = 0
  let declinedCount = 0
  let pendingCount = 0

  for (const service of services) {
    const decision = decisions[service.id] ?? 'pending'
    if (decision === 'approved') {
      approvedJobs += service.jobCost
      approvedCount++
    } else if (decision === 'declined') {
      declinedJobs += service.jobCost
      declinedCount++
    } else {
      pendingCount++
    }
  }

  approvedJobs = round2(approvedJobs)
  declinedJobs = round2(declinedJobs)
  const fees = round2(approvedJobs * FEE_RATE)
  const subtotal = round2(approvedJobs + fees)
  const tax = round2(subtotal * TAX_RATE)
  const grandTotal = round2(subtotal + tax)

  return {
    approvedJobs,
    declinedJobs,
    fees,
    subtotal,
    tax,
    grandTotal,
    approvedCount,
    declinedCount,
    pendingCount,
  }
}
