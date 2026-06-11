/**
 * Asch & Milgram's Stage — the classic line-judgment task with a planted
 * audience. On critical rounds the confederates confidently pick the wrong
 * line; conform or trust your eyes. Pure data + scoring.
 */
export interface AschRound {
  id: string
  /** Standard line length (relative units the UI renders as bars). */
  standard: number
  /** Three comparison line lengths. */
  options: [number, number, number]
  /** Index of the option that truly matches the standard. */
  correct: 0 | 1 | 2
  /** Index the confederate audience loudly agrees on. */
  groupAnswer: 0 | 1 | 2
  /** Critical rounds are where the group is (confidently) wrong. */
  critical: boolean
}

export interface AschResult {
  correct: boolean
  conformed: boolean
  independent: boolean
}

export const ASCH_ROUNDS: AschRound[] = [
  {
    id: 'warmup',
    standard: 8,
    options: [5, 8, 11],
    correct: 1,
    groupAnswer: 1,
    critical: false,
  },
  {
    id: 'critical-1',
    standard: 7,
    options: [7, 5, 9],
    correct: 0,
    groupAnswer: 2,
    critical: true,
  },
  {
    id: 'critical-2',
    standard: 9,
    options: [11, 9, 6],
    correct: 1,
    groupAnswer: 0,
    critical: true,
  },
  {
    id: 'critical-3',
    standard: 6,
    options: [4, 6, 8],
    correct: 1,
    groupAnswer: 0,
    critical: true,
  },
]

export function scoreChoice(round: AschRound, choice: 0 | 1 | 2): AschResult {
  const correct = choice === round.correct
  return {
    correct,
    conformed: round.critical && choice === round.groupAnswer && !correct,
    independent: round.critical && correct,
  }
}

export function summarizeAsch(results: AschResult[]): {
  conformed: number
  independent: number
  message: string
} {
  const conformed = results.filter((r) => r.conformed).length
  const independent = results.filter((r) => r.independent).length
  const message =
    conformed > 0
      ? `You went with the crowd on ${conformed} critical round${conformed === 1 ? '' : 's'} — exactly what about a third of Asch's participants did on any given trial. Feeling the pull is the lesson; nobody is immune.`
      : 'You trusted your eyes on every critical round. In Asch’s studies only about a quarter never conformed — though even they reported feeling the squeeze of the unanimous crowd.'
  return { conformed, independent, message }
}
