/**
 * Loftus' Photo Studio — witness a scene, then answer an interview where the
 * questions themselves plant misinformation. Pure data + evaluation.
 */
export interface LoftusOption {
  id: string
  text: string
}

export interface LoftusQuestion {
  id: string
  prompt: string
  options: LoftusOption[]
  /** Option id of the true detail, or null when no answer is factual (estimates). */
  correctId: string | null
  /** Option ids that accept the planted misinformation. */
  plantedIds: string[]
  /** Whether the wording itself carries a false presupposition. */
  leading: boolean
  /** Debrief shown after answering. */
  reveal: string
}

/** What ACTUALLY happened in the witnessed scene. */
export const SCENE_FACTS: string[] = [
  'A blue delivery cart rolled past the fountain.',
  'The street sign by the corner read YIELD.',
  'A baker crossed carrying two loaves of bread.',
  'A dog napped by the fountain — no leash, no collar.',
]

export const QUESTIONS: LoftusQuestion[] = [
  {
    id: 'cart-color',
    prompt: 'First, an easy one for the record: what color was the delivery cart?',
    options: [
      { id: 'cart-blue', text: 'Blue' },
      { id: 'cart-red', text: 'Red' },
      { id: 'cart-green', text: 'Green' },
    ],
    correctId: 'cart-blue',
    plantedIds: [],
    leading: false,
    reveal:
      'A neutral question, neutrally worded — your memory usually does fine here. Now watch what the *wording* does next.',
  },
  {
    id: 'stop-sign',
    prompt:
      'How fast was the cart going when it raced past the STOP sign?',
    options: [
      { id: 'speed-fast', text: 'Quite fast — it was racing' },
      { id: 'speed-slow', text: 'Fairly slowly' },
      { id: 'speed-resist', text: 'Hold on — that was a YIELD sign' },
    ],
    correctId: 'speed-resist',
    plantedIds: ['speed-fast', 'speed-slow'],
    leading: true,
    reveal:
      'The sign read YIELD. The question smuggled in a STOP sign (and the verb “raced”) — answer the speed and you quietly adopt both. This is the 1974 Loftus & Palmer move: “smashed” vs. “hit” changed speed estimates and even planted broken glass.',
  },
  {
    id: 'leash',
    prompt: 'What color was the leash on the dog by the fountain?',
    options: [
      { id: 'leash-red', text: 'Red' },
      { id: 'leash-brown', text: 'Brown' },
      { id: 'leash-none', text: 'There was no leash' },
    ],
    correctId: 'leash-none',
    plantedIds: ['leash-red', 'leash-brown'],
    leading: true,
    reveal:
      'The dog napped unleashed. Ask “what color was the leash?” and many witnesses will pick one — the presupposition becomes a memory. Pure misinformation effect.',
  },
  {
    id: 'baker',
    prompt: 'And the baker — what was the baker carrying?',
    options: [
      { id: 'baker-bread', text: 'Two loaves of bread' },
      { id: 'baker-cakes', text: 'A tray of cakes' },
      { id: 'baker-nothing', text: 'Nothing at all' },
    ],
    correctId: 'baker-bread',
    plantedIds: [],
    leading: false,
    reveal:
      'Bread it was. Notice how much easier honest recall feels when the question isn’t pushing you anywhere.',
  },
]

export function evaluateAnswer(
  questionId: string,
  optionId: string,
): { planted: boolean; correct: boolean | null } {
  const q = QUESTIONS.find((x) => x.id === questionId)
  if (!q) return { planted: false, correct: null }
  return {
    planted: q.plantedIds.includes(optionId),
    correct: q.correctId === null ? null : q.correctId === optionId,
  }
}

/** How many answers accepted planted misinformation. */
export function countPlanted(answers: Record<string, string>): number {
  return Object.entries(answers).reduce((n, [qId, optId]) => {
    return n + (evaluateAnswer(qId, optId).planted ? 1 : 0)
  }, 0)
}

export function memorySummary(plantedCount: number): string {
  if (plantedCount === 0) {
    return (
      'Remarkable — you caught every false presupposition. Most witnesses do not: ' +
      'in Loftus’ studies, a single word reliably bent recall.'
    )
  }
  return (
    `The interview planted ${plantedCount} false detail${plantedCount === 1 ? '' : 's'} ` +
    'in your “developed photo.” No trickery on your part — memory is a reconstruction, ' +
    'and whatever is in the air during the rebuild gets woven in. This is why leading ' +
    'questions are kept out of real courtrooms.'
  )
}
