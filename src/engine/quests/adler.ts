/**
 * Alfred Adler — the belonging task. Two lonely townsfolk per round; the
 * connecting choice is the one that gives BOTH a way to contribute (social
 * interest), not mere proximity or one-way charity.
 */
export interface BelongingRound {
  id: string
  /** The two lonely neighbors, described with what they quietly have to offer. */
  personA: string
  personB: string
  options: string[]
  /** The option embodying social interest — a task that needs them both. */
  correct: string
  /** Adler's teaching line for the debrief. */
  why: string
}

export const BELONGING_ROUNDS: BelongingRound[] = [
  {
    id: 'seamstress-clockmaker',
    personA:
      'Edda the seamstress eats lunch on her step alone. Her hands are precise as a metronome, but she says nobody needs precision anymore.',
    personB:
      'Old Tomas the retired clockmaker feeds pigeons by the fountain. His eyes are going; his stories about escapements are not.',
    options: [
      'Sit them at the same café table and hope conversation starts',
      'Have them restore the town-hall clock together — his knowledge, her hands',
      'Tell Edda that Tomas is lonely and could use some cheering up',
    ],
    correct: 'Have them restore the town-hall clock together — his knowledge, her hands',
    why:
      'Proximity is not belonging, and being someone\'s charity case deepens the feeling of uselessness. A shared task that genuinely needs each of them turns two private inferiorities into one public contribution — that is social interest doing its work.',
  },
  {
    id: 'baker-boy',
    personA:
      'Widow Greta bakes twice the bread she can sell, from habit, and gives the rest to no one because "nobody asks."',
    personB:
      'Young Pieter loiters by the arcade insisting he is bored — and mentions, twice, that nobody at school thinks he is good at anything.',
    options: [
      'Give Pieter a coin to fetch Greta\'s groceries as a favor to her',
      'Suggest Greta simply bake less bread and rest more',
      'Put Pieter on the morning bread round — Greta\'s surplus, his own delivery route',
    ],
    correct: 'Put Pieter on the morning bread round — Greta\'s surplus, his own delivery route',
    why:
      'The boy\'s "boredom" is discouragement wearing a costume — every child strives to feel capable, and mischief is what striving does with nowhere to go. Give him a real responsibility that others rely on and the striving turns useful. Greta, meanwhile, is needed again. Encouragement, not correction.',
  },
]

export function isConnectingChoice(round: BelongingRound, choice: string): boolean {
  return choice === round.correct
}

export const ADLER_SUMMARY =
  'Both neighbors now have somewhere to be — which was never about geography. Feelings of inferiority are universal and useful: they are the engine. What matters is whether they drive us toward contribution or into retreat. Community feeling — Gemeinschaftsgefühl — is my whole psychology in one word.'
