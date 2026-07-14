/**
 * Above this many services, the estimate switches to its "long list" behaviors,
 * tuned so the canonical short estimate stays calm and document-like:
 *
 *   1. TopBar swaps discrete per-service pips for a continuous composition fill
 *      + `decided/total` count (pips stop being legible — and stop fitting the
 *      header — past a handful of items).
 *   2. ServiceCard collapses its "why" to one line by default (tap to expand),
 *      so a long list doesn't become a wall of reasoning text.
 *   3. TriageSection pins the sort control, because re-triaging by cost/urgency
 *      becomes a real, repeated action once the list is long.
 *
 * Chosen at 6: the point where a row of pips stops reading as distinct marks and
 * where scroll length starts to dominate the experience.
 */
export const SCALE_THRESHOLD = 6

/** True when the service list is long enough to warrant the scaled behaviors. */
export const isLongList = (count: number): boolean => count > SCALE_THRESHOLD
