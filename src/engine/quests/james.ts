/**
 * William James — three drifting "stream of consciousness" wisps. Each wisp
 * carries a thought-fragment; the instant it is caught it reads differently,
 * because a thought re-entered is never the same thought. Positions are pure
 * functions of time so the drift is deterministic and testable.
 */
export interface Wisp {
  id: string
  /** The thought as it drifts past. */
  fragment: string
  /** The same thought the instant you hold it — already changed. */
  echo: string
}

export const WISPS: Wisp[] = [
  {
    id: 'supper',
    fragment: '…wonder what’s for supper — bread, probably, and the good soft cheese…',
    echo: '…caught it — and now it’s a thought about *having wondered* about supper. The original slipped downstream.',
  },
  {
    id: 'name',
    fragment: '…her name is right THERE, it starts with an M, or — no, it hums like an M…',
    echo: '…held still, the almost-name collapses into the feeling of almost. James called this the *fringe* — the halo around every thought.',
  },
  {
    id: 'rain',
    fragment: '…smell of rain on warm cobbles, and suddenly being six years old again…',
    echo: '…examined, the memory becomes a memory OF remembering. You cannot step into the same stream twice — nor think the same thought.',
  },
]

/**
 * Where wisp `index` floats at time `t` (seconds), in unit coordinates.
 * Lissajous-style drift: bounded, smooth, distinct per wisp, deterministic.
 */
export function wispPosition(index: number, t: number): { x: number; y: number } {
  const phase = index * 2.1
  const fx = 0.21 + index * 0.045
  const fy = 0.16 + index * 0.05
  return {
    x: 0.5 + 0.42 * Math.sin(t * fx + phase),
    y: 0.5 + 0.38 * Math.sin(t * fy + phase * 1.7 + 1.2),
  }
}

export function allCaught(caughtIds: ReadonlySet<string>): boolean {
  return WISPS.every((w) => caughtIds.has(w.id))
}

/** Closing line for the panel once the stream has been sampled. */
export const JAMES_SUMMARY =
  'Three catches, three transformations. Consciousness, James wrote in 1890, is not a chain of beads but a stream: personal, continuous, ever-changing, always about something. Study the water, not the buckets.'
