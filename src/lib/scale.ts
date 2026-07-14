/**
 * Above this many services, the estimate switches to its "long list" behaviors,
 * tuned so the canonical short estimate stays calm and document-like. Both are
 * driven from TriageSection:
 *
 *   1. ServiceCard collapses its "why" to one line by default (tap to expand),
 *      so a long list doesn't become a wall of reasoning text.
 *   2. The sort control pins under the app bar, because re-triaging by
 *      cost/urgency becomes a real, repeated action once the list is long.
 *
 * Chosen at 6: the point where scroll length starts to dominate the experience
 * and a persistent sort control begins to earn its keep.
 */
export const SCALE_THRESHOLD = 6

/** True when the service list is long enough to warrant the scaled behaviors. */
export const isLongList = (count: number): boolean => count > SCALE_THRESHOLD
