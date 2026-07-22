/**
 * Mary Ainsworth — Strange Situation reunion beats. The player watches three
 * street vignettes of a toddler greeting a returning caregiver and classifies
 * each by attachment style. Faithful to the 1970s Baltimore work.
 */
export type AttachmentStyle = 'secure' | 'avoidant' | 'resistant'

export const ATTACHMENT_LABELS: Record<AttachmentStyle, string> = {
  secure: 'Secure',
  avoidant: 'Insecure-avoidant',
  resistant: 'Insecure-resistant (ambivalent)',
}

export interface ReunionRound {
  id: string
  /** What the player watches at the moment of reunion. */
  vignette: string
  correct: AttachmentStyle
  /** Ainsworth's reading of the scene, shown after the choice. */
  read: string
}

export interface ReunionResult {
  correct: boolean
}

export const REUNION_ROUNDS: ReunionRound[] = [
  {
    id: 'pram',
    vignette:
      'The little one by the pram was fussing while her mother queued at Pavlov\'s. Mother returns — the child lights up, reaches to be held, settles against her shoulder within moments, then wriggles down and goes straight back to stacking pebbles.',
    correct: 'secure',
    read:
      'Distress at separation, delight and quick comfort at reunion, then back to exploring — the caregiver is a secure base. In my Baltimore study roughly two-thirds of infants greeted a return this way.',
  },
  {
    id: 'blocks',
    vignette:
      'The boy with the wooden blocks barely looked up when his father left. Father returns and crouches with open arms — the boy glances over, then deliberately turns back to his tower, playing on as if no one had gone anywhere.',
    correct: 'avoidant',
    read:
      'The studied indifference is the tell: avoidant infants mute the whole attachment display. Their heart rate tells another story — the calm is a strategy, not an absence of feeling.',
  },
  {
    id: 'fountain',
    vignette:
      'The toddler at the fountain sobbed the entire time her grandmother was away. Grandmother returns — the child runs over crying and clings hard, then arches back, pushes at her shoulder, and cannot settle no matter how she is rocked.',
    correct: 'resistant',
    read:
      'Seeking contact and resisting it in the same breath — that ambivalence defines the resistant pattern. The child cannot rely on comfort being there, so arrival and anger come tangled together.',
  },
]

export function scoreReunion(
  round: ReunionRound,
  choice: AttachmentStyle,
): ReunionResult {
  return { correct: choice === round.correct }
}

/** Closing message; honest about scores and about the later fourth category. */
export function summarizeReunions(nCorrect: number): string {
  const total = REUNION_ROUNDS.length
  const opening =
    nCorrect === total
      ? `All ${total} reunions read correctly — you watched the way my Baltimore observers learned to watch.`
      : `You read ${nCorrect} of ${total} reunions the way my coders would have.`
  return (
    `${opening} Remember: no single afternoon fixes a child's future — styles describe a relationship's pattern, not a verdict. ` +
    'And years later my student Mary Main added a fourth, rarer pattern, disorganized, for children whose strategies collapse entirely.'
  )
}
