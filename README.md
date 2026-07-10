# Tekmetric — Estimate Approval Prototype

A responsive, customer-facing prototype for reviewing a repair estimate over SMS:
review recommended services, approve/decline each, sign, and authorize the work.
Built to demonstrate the two things a static file can't — **live ledger
recalculation** and the **mobile → desktop responsive reflow**.

**▶ Live demo:** https://mooque-dev.github.io/tekmetric-estimate-approval/

Resize the browser (or use device toolbar) to see the reflow from a single
phone column to the desktop two-column layout with a sticky ledger rail.

## Run

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173) and resize to see the reflow:
single column with a sticky bottom total bar (<768px) → two columns with the
ledger promoted to a sticky rail (tablet 768px+) → wider rail and gutters
(desktop 1024px+).

## Where things live

- `src/data/estimate.ts` — **the single, well-labeled data file.** Every figure
  traces to `Design Challenge.pdf`. Read the header comment: it documents the one
  place the PDF's numbers don't reconcile and exactly how this build resolves it.
- `src/lib/ledger.ts` — live recalculation (approved jobs → fees → tax → total).
- `src/hooks/useEstimate.ts` — all client state (decisions, sort, signature).
- `src/components/` — three zones: `TrustAnchor`, `TriageSection` (+ `ServiceCard`,
  `SortControl`), and `AuthorizationSummary` (+ `SignaturePad`, `StickyTotalBar`,
  `Confirmation`). `AnimatedNumber` drives the count up/down on the total.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds with Vite
and publishes `dist/` to GitHub Pages. Vite's `base` is set to the repo name in
production ([vite.config.ts](vite.config.ts)) so assets resolve at the Pages
subpath; local dev stays at `/`.

## The one data decision (see estimate.ts for the full note)

The PDF prints a grand ledger that reconciles to **$249.27** and a set of
per-service subtotal/tax/job-total lines that **don't** reconcile with it. Only
one model hits the $249.27 checksum: each job's cost = its **labor + parts**
(summing to the PDF's "Total Jobs" $224.55), with **fees and tax applied at the
order level** and scaled proportionally so partial approvals stay consistent.
Approving all three reproduces the printed ledger exactly:

`$224.55 jobs + $15.78 fees = $240.33 subtotal + $8.94 tax = $249.27`.

## Interaction gate

The **Authorize** button is disabled until every service is addressed (zero
pending) **and** a signature is applied; the reason is always surfaced
("2 services still need a decision", "Add your signature to continue"). Declined
items stay on the page — struck through and de-emphasized — so they can be
reversed.
