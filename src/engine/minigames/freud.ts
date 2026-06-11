/**
 * Freud's Couch — match a dream's MANIFEST content (the strange story you
 * remember) to its LATENT reading per classic psychoanalytic theory.
 * Framed in-game as historical theory, not modern clinical fact.
 */
export interface DreamSymbol {
  id: string
  /** Manifest content: what appeared in the dream. */
  manifest: string
  emoji: string
  /** The classic Freudian latent reading. */
  latent: string
  /** Two plausible-but-wrong decoy readings. */
  decoys: [string, string]
}

export interface FreudRound {
  symbol: DreamSymbol
  options: string[]
}

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'flying',
    manifest: 'You soar over the rooftops of a sleeping town',
    emoji: '🕊️',
    latent: 'A wish for freedom — escaping a constraint you feel by day',
    decoys: [
      'A warning to check the weather before traveling',
      'Proof that you were a bird in a former life',
    ],
  },
  {
    id: 'teeth',
    manifest: 'Your teeth crumble and fall, one by one',
    emoji: '🦷',
    latent: 'Anxiety about losing power, face, or control',
    decoys: [
      'A simple reminder to visit the dentist',
      'A craving for harder food in your diet',
    ],
  },
  {
    id: 'locked-room',
    manifest: 'A house you know well — but one door is always locked',
    emoji: '🚪',
    latent: 'A part of yourself kept repressed, awaiting acknowledgment',
    decoys: [
      'You misplaced a key somewhere yesterday',
      'The house next door is secretly for sale',
    ],
  },
  {
    id: 'chase',
    manifest: 'Something pursues you down an endless lane; you never see it',
    emoji: '🌫️',
    latent: 'Avoidance — a feeling you flee rather than face',
    decoys: [
      'You should take up running competitively',
      'A stray dog has been following you around town',
    ],
  },
  {
    id: 'train',
    manifest: 'The train pulls away just as you reach the platform',
    emoji: '🚂',
    latent: 'A feared missed opportunity — a wish you suspect has expired',
    decoys: [
      'Public transport in your area is unreliable',
      'You secretly dislike traveling by rail',
    ],
  },
]

export function isCorrectInterpretation(symbolId: string, reading: string): boolean {
  const symbol = DREAM_SYMBOLS.find((s) => s.id === symbolId)
  return symbol !== undefined && symbol.latent === reading
}

/** One round per symbol; options are the latent reading + decoys, shuffled. */
export function buildFreudRounds(shuffleFn: <T>(arr: T[]) => T[]): FreudRound[] {
  return shuffleFn(DREAM_SYMBOLS).map((symbol) => ({
    symbol,
    options: shuffleFn([symbol.latent, ...symbol.decoys]),
  }))
}
