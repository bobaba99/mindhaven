/**
 * Leon Festinger — the dissonance errand. Leon narrates a market choice; the
 * player flags each line that is dissonance-reduction (belief repair) rather
 * than plain fact. Scored as hits / misses / false alarms.
 */
export interface DissonanceLine {
  id: string
  /** What Leon says on the walk. */
  text: string
  /** True when the line is rationalization, not description. */
  rationalization: boolean
  /** Why — shown in the debrief. */
  tell: string
}

export interface FlagScore {
  hits: number
  misses: number
  falseAlarms: number
}

export const DISSONANCE_LINES: DissonanceLine[] = [
  {
    id: 'price',
    text: 'The east stall wanted three coins for peaches. The plums were two.',
    rationalization: false,
    tell: 'Plain fact — prices are checkable. No repair work happening yet.',
  },
  {
    id: 'fuzz',
    text: 'Peaches are overrated anyway. All fuzz, no flavor — everyone says so.',
    rationalization: true,
    tell:
      'Sour grapes: the forgone option gets devalued after the choice, so the choice stops stinging. Note the sudden appeal to "everyone."',
  },
  {
    id: 'coins',
    text: 'I had two coins in my pocket this morning.',
    rationalization: false,
    tell: 'Fact again — a constraint, honestly reported.',
  },
  {
    id: 'superior',
    text: 'And frankly the plum is the objectively superior fruit. It is not close.',
    rationalization: true,
    tell:
      'Spreading of alternatives: after choosing, the chosen option inflates and the rejected one deflates — the gap grows to justify the decision.',
  },
  {
    id: 'never-liked',
    text: 'Honestly, I never even liked peaches. Never have.',
    rationalization: true,
    tell:
      'History rewritten to match the behavior. He was queuing for peaches ten minutes ago — when belief and action disagree, belief often blinks.',
  },
  {
    id: 'closer',
    text: 'Also the plum stall is on my way home.',
    rationalization: false,
    tell: 'A checkable convenience. Facts are allowed to support a choice.',
  },
]

const RATIONALIZATION_IDS = new Set(
  DISSONANCE_LINES.filter((l) => l.rationalization).map((l) => l.id),
)

/** Score a set of flagged line ids against the true rationalizations. */
export function scoreFlags(flagged: ReadonlySet<string>): FlagScore {
  let hits = 0
  let falseAlarms = 0
  for (const id of flagged) {
    if (RATIONALIZATION_IDS.has(id)) hits += 1
    else if (DISSONANCE_LINES.some((l) => l.id === id)) falseAlarms += 1
  }
  return {
    hits,
    misses: RATIONALIZATION_IDS.size - hits,
    falseAlarms,
  }
}

export function summarizeDissonance(score: FlagScore): string {
  const caught =
    score.misses === 0 && score.falseAlarms === 0
      ? 'You caught every repair and let the facts stand — my compliments; most people are gentler with me.'
      : `You caught ${score.hits} of ${RATIONALIZATION_IDS.size} repairs` +
        (score.falseAlarms > 0
          ? `, though you also accused ${score.falseAlarms} innocent fact${score.falseAlarms === 1 ? '' : 's'}.`
          : '.')
  return (
    `${caught} The machinery is from my 1959 study with Carlsmith: paid $20 to praise a dull task, people stayed honest with themselves — the money explained the lie. ` +
    'Paid just $1, they had no cover story, so the belief itself shifted: "perhaps it wasn\'t so dull." The smaller the justification, the larger the repair.'
  )
}
