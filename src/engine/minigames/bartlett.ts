/**
 * Bartlett's Story-Swap Stand — "The War of the Ghosts" retold across
 * generations. At each swap the player picks how a detail actually warps:
 * memory reconstructs toward the familiar (schema), it neither photocopies
 * (verbatim) nor scrambles (random). Faithful to Remembering (1932).
 */
export type DistortionKind = 'verbatim' | 'schema' | 'random'

export interface GenerationOption {
  text: string
  kind: DistortionKind
}

export interface Generation {
  id: string
  /** The original detail about to be retold. */
  detail: string
  options: GenerationOption[]
  /** Bartlett's name for this distortion. */
  term: string
  why: string
}

export interface GenerationResult {
  correct: boolean
}

export const ORIGINAL_PASSAGE =
  'One night two young men from Egulac went down to the river to hunt seals, and while they were there it became foggy and calm. Then they heard war-cries, and thought: "Maybe this is a war-party." Canoes came up, and one of the men in them said: "We are going up the river to make war on the people." One young man went; and in the fight he heard someone say the warriors were ghosts. He did not feel sick, but they said he had been hit...'

export const GENERATIONS: Generation[] = [
  {
    id: 'canoes',
    detail: '“Canoes came up the river, carrying the war-party.”',
    options: [
      { text: 'Canoes came up the river, word for word, every retelling', kind: 'verbatim' },
      { text: 'Boats came up the river — canoes quietly turned familiar', kind: 'schema' },
      { text: 'Bicycles came up the river, ridden by geese', kind: 'random' },
    ],
    term: 'Assimilation (to the familiar)',
    why:
      'Bartlett\'s Cambridge retellers had no canoes in their daily world, so canoes became boats, paddling became rowing, seal-hunting became fishing. Memory redraws the unfamiliar in the teller\'s own cultural furniture — not randomly, but toward what already fits their schema.',
  },
  {
    id: 'ghosts',
    detail: '“He heard someone say the warriors were ghosts.”',
    options: [
      { text: 'The ghosts stay exactly as told, mysterious and unexplained', kind: 'verbatim' },
      { text: 'The ghosts fade out entirely, or get explained away as a clan name', kind: 'schema' },
      { text: 'The ghosts multiply into an army of dragons', kind: 'random' },
    ],
    term: 'Leveling & rationalization',
    why:
      'The supernatural core of the story — the very title! — was the first thing to go. Retellers dropped the ghosts (leveling) or tidied them into something sensible, like the name of a tribe (rationalization). What a schema cannot digest, it deletes or explains.',
  },
  {
    id: 'wound',
    detail: '“Something black came out of his mouth, and he died.”',
    options: [
      { text: 'The strange detail persists verbatim in every retelling', kind: 'verbatim' },
      { text: 'It sharpens into the vivid centerpiece: “he foamed at the mouth and died at sunrise”', kind: 'schema' },
      { text: 'He recovers fully and opens a bakery', kind: 'random' },
    ],
    term: 'Sharpening',
    why:
      'While most details erode, a few get promoted: retold more vividly and confidently each generation, becoming the story\'s new anchor. Bartlett called it sharpening — the complement of leveling. The reconstruction keeps a dramatic shape even as it sheds the facts.',
  },
]

export function scoreGeneration(g: Generation, choice: string): GenerationResult {
  const schema = g.options.find((o) => o.kind === 'schema')
  return { correct: schema !== undefined && schema.text === choice }
}

export function summarizeBartlett(nCorrect: number): string {
  const total = GENERATIONS.length
  const opening =
    nCorrect === total
      ? `All ${total} distortions predicted — you think like a schema already.`
      : `You predicted ${nCorrect} of ${total} distortions.`
  return (
    `${opening} Bartlett's conclusion, from Remembering (1932): recall is not playback but an "effort after meaning" — ` +
    'we rebuild each memory from a schema, our organized past experience, patching gaps with what must have been. Sixty years later, this is why eyewitnesses need corroboration and why your best anecdote keeps improving.'
  )
}
