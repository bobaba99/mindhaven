/**
 * Ebbinghaus's Forgetting-Curve Bakery — learn nonsense syllables the 1885
 * way, watch retention stale on his actual measured curve, then feel the
 * "savings" of relearning. Pure data + scoring.
 */
export interface CurvePoint {
  /** Hours since learning. */
  hours: number
  /** Fraction retained (Ebbinghaus's 1885 savings measurements). */
  retention: number
}

/** The real 1885 data: retention measured as savings on relearning. */
export const FORGETTING_CURVE: CurvePoint[] = [
  { hours: 1 / 3, retention: 0.58 }, // 20 minutes
  { hours: 1, retention: 0.44 },
  { hours: 9, retention: 0.36 },
  { hours: 24, retention: 0.34 },
  { hours: 144, retention: 0.25 }, // 6 days
  { hours: 744, retention: 0.21 }, // 31 days
]

/**
 * Piecewise-linear retention over the measured curve. 1 at t=0; beyond the
 * last point it flattens at that floor — Ebbinghaus's own finding that some
 * savings persist for a month and beyond.
 */
export function retentionAt(hours: number): number {
  if (hours <= 0) return 1
  let prev: CurvePoint = { hours: 0, retention: 1 }
  for (const point of FORGETTING_CURVE) {
    if (hours <= point.hours) {
      const span = point.hours - prev.hours
      const frac = span === 0 ? 1 : (hours - prev.hours) / span
      return prev.retention + (point.retention - prev.retention) * frac
    }
    prev = point
  }
  return FORGETTING_CURVE[FORGETTING_CURVE.length - 1].retention
}

/** The syllables the baker asks you to learn (CVC, meaningless by design). */
export const SYLLABLE_TARGETS = ['ZOK', 'BAF', 'MIB', 'DUS'] as const

const SYLLABLE_DECOYS = ['KEV', 'POM', 'RIT', 'LUN', 'WEP'] as const

export interface RecallItem {
  syllable: string
  isTarget: boolean
}

export interface RecallScore {
  hits: number
  falseAlarms: number
}

/** The recall test: targets mixed among decoys, order via injected shuffle. */
export function buildRecallBank(
  shuffleFn: <T>(arr: T[]) => T[],
): RecallItem[] {
  return shuffleFn([
    ...SYLLABLE_TARGETS.map((s) => ({ syllable: s, isTarget: true })),
    ...SYLLABLE_DECOYS.map((s) => ({ syllable: s, isTarget: false })),
  ])
}

export function scoreRecall(picked: ReadonlySet<string>): RecallScore {
  const targets = new Set<string>(SYLLABLE_TARGETS)
  let hits = 0
  let falseAlarms = 0
  for (const p of picked) {
    if (targets.has(p)) hits += 1
    else falseAlarms += 1
  }
  return { hits, falseAlarms }
}

export function summarizeSavings(secondRecallHits: number): string {
  const opening =
    secondRecallHits >= SYLLABLE_TARGETS.length
      ? 'A full tray recalled even after the shelf went stale — better than my averages.'
      : secondRecallHits === 0
        ? 'An empty tray — precisely why I measured differently.'
        : `${secondRecallHits} of ${SYLLABLE_TARGETS.length} survived the afternoon.`
  return (
    `${opening} Here is my real discovery: even when recall fails, RELEARNING is faster than the first learning ever was. ` +
    'I called the difference savings — the part of memory that never quite leaves the oven. Forgetting is steepest in the first hour, then the curve flattens; what survives a day tends to survive a month.'
  )
}
