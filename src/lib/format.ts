/** Round to cents, avoiding binary-float drift (e.g. 15.779999…). */
export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100

/** "$1,234.50" — always two decimals, grouped thousands. */
export const money = (n: number): string =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
