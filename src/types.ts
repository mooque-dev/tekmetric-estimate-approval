// ---------------------------------------------------------------------------
// Domain types for the estimate-approval flow.
// ---------------------------------------------------------------------------

export type Urgency = 'critical' | 'maintenance'

/** Every service starts Pending. Nothing is approved by default. */
export type Decision = 'pending' | 'approved' | 'declined'

export interface LineItem {
  /** e.g. "R&R Drive Belt (Accessory/Serpentine)" */
  label: string
  /** "Labor" or "Parts" */
  kind: 'labor' | 'parts'
  /** Optional detail shown in muted type, e.g. "Qty: 1". */
  detail?: string
  amount: number
}

export interface Service {
  id: string
  title: string
  urgency: Urgency
  /** One plain-English line: why this matters to the customer. */
  why: string
  lineItems: LineItem[]
  /**
   * The job's cost that enters the ledger = sum of its line items
   * (labor + parts). See src/data/estimate.ts for why this — not the PDF's
   * per-service "Job Total" — is the authoritative per-job figure.
   */
  jobCost: number
}

export interface ShopInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
}

export interface VehicleInfo {
  year: number
  make: string
  model: string
  color: string
  plate: string
  vin: string
}

export interface CustomerInfo {
  name: string
  phone: string
  repairOrder: string
  /** Reported concerns, echoed back verbatim from the PDF. */
  concerns: string
}
