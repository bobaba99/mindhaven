/**
 * Bandura's Bobo Gym — watch the trainer's combo, then reproduce it from
 * memory: attention → retention → reproduction → motivation. Mastered rounds
 * build self-efficacy. Pure sequence logic; rng injected for testability.
 */
export const MOVES = ['Jab', 'Duck', 'Hook', 'Step'] as const
export type Move = (typeof MOVES)[number]

export type ReproductionVerdict = 'pending' | 'fail' | 'success'

/** Rounds needed to master the modeling drill. */
export const ROUNDS_TO_MASTER = 3
/** First round shows this many moves; each round adds one. */
const BASE_SEQUENCE_LENGTH = 2

export function sequenceLengthFor(round: number): number {
  return BASE_SEQUENCE_LENGTH + round
}

export function generateSequence(length: number, rng: () => number): Move[] {
  return Array.from({ length }, () => {
    const idx = Math.min(MOVES.length - 1, Math.floor(rng() * MOVES.length))
    return MOVES[idx]
  })
}

/**
 * Judge the attempt so far: a correct prefix is 'pending', any deviation is
 * 'fail', and an exact full-length match is 'success'.
 */
export function checkReproduction(target: Move[], attempt: Move[]): ReproductionVerdict {
  if (attempt.length > target.length) return 'fail'
  for (let i = 0; i < attempt.length; i++) {
    if (attempt[i] !== target[i]) return 'fail'
  }
  return attempt.length === target.length ? 'success' : 'pending'
}

/** Self-efficacy XP for mastering a round — later rounds count for more. */
export function efficacyGain(round: number): number {
  return 10 * round
}
