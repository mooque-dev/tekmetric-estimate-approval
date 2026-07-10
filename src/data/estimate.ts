// ===========================================================================
//  AUTHORITATIVE SAMPLE DATA  —  Tekmetric Design Challenge PDF
//  Every figure below traces directly to "Design Challenge.pdf" (pages 2–3).
//  Nothing here is invented. Where a design decision was required, it is
//  called out in comments with the reasoning, so it can be checked in critique.
// ===========================================================================
//
//  CHECKSUM (from PDF): Jennifer Willson · 2021 Toyota Highlander Hybrid ·
//  3 recommended services · Grand Total $249.27.
//
// ---------------------------------------------------------------------------
//  NOTE ON THE NUMBERS — read before editing prices
// ---------------------------------------------------------------------------
//  The PDF prints two sets of figures that do NOT reconcile with each other:
//
//   A) A grand ledger (PDF "Step 2: Authorize work"):
//        Total Jobs  $224.55
//        Total Fees  $ 15.78
//        Subtotal    $240.33   (= 224.55 + 15.78)      ✓ internally consistent
//        Taxes       $  8.94
//        Grand Total $249.27   (= 240.33 +  8.94)      ✓ == checksum
//
//   B) Per-service "Subtotal / Estimated Tax / Job Total" lines. These do NOT
//      sum to the grand total (their Job Totals sum to $239.46, not $249.27),
//      and each per-service Subtotal does not equal its own labor + parts.
//
//  Only ONE model reconciles to the $249.27 checksum, and it happens to match
//  Tekmetric's real ledger shape:
//
//        each job's cost  = its labor + parts (the itemized line items)
//        Serpentine  79.20 + 21.29 = 100.49
//        Air Filter  52.80 + 33.47 =  86.27
//        Cabin        0.00 + 37.79 =  37.79
//                                    -------
//        Total Jobs                  224.55   ← exactly the PDF's "Total Jobs"
//
//  So we treat labor + parts as each job's authoritative cost, and apply
//  fees + tax at the ORDER level (see src/lib/ledger.ts). This lets the ledger
//  recalculate live as jobs are approved/declined while landing exactly on
//  $249.27 when all three are approved. The PDF's per-service Subtotal/Tax/Job
//  Total lines (set B) are intentionally NOT used, because they are internally
//  inconsistent with the grand total the challenge asks us to hit.
// ---------------------------------------------------------------------------

import type { CustomerInfo, Service, ShopInfo, VehicleInfo } from '../types'

export const shop: ShopInfo = {
  name: "Ian's Automotive Repair",
  address: '1334 Brittmoore Road, Houston, TX 77043',
  phone: '(530) 701-5732',
  email: 'john@ianautorepair.com',
  website: 'https://www.ianautorepair.com',
}

export const vehicle: VehicleInfo = {
  year: 2021,
  make: 'Toyota',
  model: 'Highlander Hybrid',
  color: 'Silver',
  plate: 'KAM9012 · VA',
  vin: 'WUWNM7EJXBW193853',
}

export const customer: CustomerInfo = {
  name: 'Jennifer Willson',
  phone: '(555) 357-4576',
  repairOrder: '132582',
  // Echoed back verbatim from the PDF ("Client concerns").
  concerns:
    'Squealing noise while driving, especially when turning. Steering feels harder than usual.',
}

// ---------------------------------------------------------------------------
//  SERVICES
//  Urgency grouping is a design decision tied to the customer's own concerns:
//  the serpentine belt drives the power-steering pump, so it directly explains
//  BOTH the squeal and the heavier steering Jennifer reported → Critical.
//  The two filters are comfort/efficiency items → Preventative Maintenance.
//  Titles, labor/parts labels, quantities and dollar amounts are verbatim PDF.
//  The "why" lines are explanatory UX copy (the brief invites clarifying copy).
// ---------------------------------------------------------------------------

export const services: Service[] = [
  {
    id: 'serpentine-belt',
    title: 'Serpentine Belt Replacement',
    urgency: 'critical',
    why: 'The serpentine belt drives your power steering and other engine systems. A worn belt is the likely source of the squeal and the heavier steering you reported — and it can fail without warning.',
    lineItems: [
      { label: 'R&R Drive Belt (Accessory/Serpentine)', kind: 'labor', amount: 79.2 },
      { label: 'Driveworks Serpentine Belt', kind: 'parts', detail: 'Qty: 1', amount: 21.29 },
    ],
    jobCost: 100.49, // 79.20 + 21.29
  },
  {
    id: 'engine-air-filter',
    title: 'Air Filter Element Replacement',
    urgency: 'maintenance',
    why: 'A clogged engine air filter restricts airflow, which lowers performance and fuel economy. A fresh element keeps the engine breathing clean.',
    lineItems: [
      { label: 'R&R Engine Air Filter Element', kind: 'labor', amount: 52.8 },
      {
        label: 'Carquest Premium Filters Engine Air Filter',
        kind: 'parts',
        detail: 'Qty: 1',
        amount: 33.47,
      },
    ],
    jobCost: 86.27, // 52.80 + 33.47
  },
  {
    id: 'cabin-air-filter',
    title: 'Cabin Air Filter Replacement',
    urgency: 'maintenance',
    why: 'The cabin filter cleans the air coming through your vents. Replacing it improves airflow and cuts down on dust and odors inside the car.',
    lineItems: [
      { label: 'Cabin Filter Replacement', kind: 'labor', amount: 0.0 },
      {
        label: 'Carquest Premium Filters Cabin Air Filter',
        kind: 'parts',
        detail: 'Qty: 1',
        amount: 37.79,
      },
    ],
    jobCost: 37.79, // 0.00 + 37.79
  },
]

// ---------------------------------------------------------------------------
//  ORDER-LEVEL FEE + TAX RATES
//  Derived from the PDF's all-approved snapshot so that approving all three
//  jobs reproduces the printed ledger exactly, and declining a job removes its
//  cost and rescales fees + tax proportionally.
//
//    Total Jobs $224.55  →  Fees $15.78   ⇒ fee rate = 15.78 / 224.55
//    Subtotal   $240.33  →  Taxes $8.94   ⇒ tax rate =  8.94 / 240.33
//
//  These are the two figures the PDF does NOT break down per service, so a
//  rate derived from its own totals is the most faithful way to make them live.
// ---------------------------------------------------------------------------

export const TOTAL_JOBS_ALL_APPROVED = 224.55
export const SUBTOTAL_ALL_APPROVED = 240.33

export const FEE_RATE = 15.78 / TOTAL_JOBS_ALL_APPROVED // ≈ 0.070274 (shop supplies fee)
export const TAX_RATE = 8.94 / SUBTOTAL_ALL_APPROVED // ≈ 0.037199 (sales tax on jobs + fees)
