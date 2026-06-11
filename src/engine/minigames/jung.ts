/**
 * Jung's Archetype Emporium — draw cards from the collective deck and swap
 * toward a BALANCED hand (sun + moon poles both represented), echoing Jung's
 * idea that wholeness means integrating the bright and shadowed sides.
 * Playful and explicitly non-diagnostic.
 */
export type ArchetypePole = 'sun' | 'moon'

export interface ArchetypeCard {
  id: string
  name: string
  pole: ArchetypePole
  line: string
}

export const ARCHETYPES: ArchetypeCard[] = [
  { id: 'hero', name: 'The Hero', pole: 'sun', line: 'Sets out anyway, knowing the dragon is real.' },
  { id: 'sage', name: 'The Wise Old One', pole: 'sun', line: 'Has read the map — and knows where it lies.' },
  { id: 'mother', name: 'The Great Mother', pole: 'sun', line: 'Feeds you before you know you are hungry.' },
  { id: 'child', name: 'The Divine Child', pole: 'sun', line: 'Sees the town as if it were built this morning.' },
  { id: 'shadow', name: 'The Shadow', pole: 'moon', line: 'Everything you swear you are not. It waves hello.' },
  { id: 'trickster', name: 'The Trickster', pole: 'moon', line: 'Swaps the signposts so you finally look up.' },
  { id: 'persona', name: 'The Persona', pole: 'moon', line: 'The mask fits so well you forget it is one.' },
  { id: 'anima', name: 'The Inner Other', pole: 'moon', line: 'The voice in you that speaks with a stranger’s accent.' },
]

export const HAND_SIZE = 5
/** A hand is balanced when both poles hold at least this many cards. */
const MIN_PER_POLE = 2

function countPole(hand: ArchetypeCard[], pole: ArchetypePole): number {
  return hand.filter((c) => c.pole === pole).length
}

export function drawHand(shuffleFn: <T>(arr: T[]) => T[]): ArchetypeCard[] {
  return shuffleFn(ARCHETYPES).slice(0, HAND_SIZE)
}

/**
 * Deal a deliberately lopsided 4–1 opening hand so the player always has to
 * swap toward balance — the integration IS the lesson.
 */
export function drawOpeningHand(shuffleFn: <T>(arr: T[]) => T[]): ArchetypeCard[] {
  const [major, minor] = shuffleFn([
    ARCHETYPES.filter((c) => c.pole === 'sun'),
    ARCHETYPES.filter((c) => c.pole === 'moon'),
  ])
  return shuffleFn([...shuffleFn(major).slice(0, 4), ...shuffleFn(minor).slice(0, 1)])
}

export function isBalanced(hand: ArchetypeCard[]): boolean {
  return countPole(hand, 'sun') >= MIN_PER_POLE && countPole(hand, 'moon') >= MIN_PER_POLE
}

/** Replace one card with a fresh draw from outside the current hand. */
export function swapCard(
  hand: ArchetypeCard[],
  outId: string,
  shuffleFn: <T>(arr: T[]) => T[],
): ArchetypeCard[] {
  const held = new Set(hand.map((c) => c.id))
  const replacement = shuffleFn(ARCHETYPES.filter((c) => !held.has(c.id)))[0]
  if (!replacement) return [...hand]
  return hand.map((c) => (c.id === outId ? replacement : c))
}

/**
 * A playful, non-diagnostic motif for a balanced hand: names the leading
 * sun card walking with its moon ally. Null while unbalanced — keep swapping.
 */
export function motifFor(hand: ArchetypeCard[]): string | null {
  if (!isBalanced(hand)) return null
  const sun = hand.find((c) => c.pole === 'sun')!
  const moon = hand.find((c) => c.pole === 'moon')!
  return (
    `Today you wander as ${sun.name} walking arm-in-arm with ${moon.name} — ` +
    `bright purpose, honest shadow. (A parlor reading, not a diagnosis: ` +
    `Jung himself said wholeness means keeping both in view.)`
  )
}
