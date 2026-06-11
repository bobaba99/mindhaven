import { describe, expect, it } from 'vitest'
import {
  ARCHETYPES,
  HAND_SIZE,
  drawHand,
  drawOpeningHand,
  isBalanced,
  motifFor,
  swapCard,
} from './jung'

const identity = <T>(arr: T[]): T[] => [...arr]

const suns = ARCHETYPES.filter((a) => a.pole === 'sun')
const moons = ARCHETYPES.filter((a) => a.pole === 'moon')

describe('jung archetype deck data', () => {
  it('holds eight archetypes split evenly between sun and moon poles', () => {
    expect(ARCHETYPES).toHaveLength(8)
    expect(suns).toHaveLength(4)
    expect(moons).toHaveLength(4)
  })

  it('has unique ids and non-empty flavor lines', () => {
    expect(new Set(ARCHETYPES.map((a) => a.id)).size).toBe(ARCHETYPES.length)
    for (const a of ARCHETYPES) expect(a.line.length).toBeGreaterThan(0)
  })
})

describe('jung hand drawing and balance', () => {
  it('draws a hand of HAND_SIZE distinct cards', () => {
    const hand = drawHand(identity)
    expect(hand).toHaveLength(HAND_SIZE)
    expect(new Set(hand.map((c) => c.id)).size).toBe(HAND_SIZE)
  })

  it('the opening hand is deliberately unbalanced so at least one swap is needed', () => {
    const hand = drawOpeningHand(identity)
    expect(hand).toHaveLength(HAND_SIZE)
    expect(new Set(hand.map((c) => c.id)).size).toBe(HAND_SIZE)
    expect(isBalanced(hand)).toBe(false)
  })

  it('a 2/3 or 3/2 split between poles counts as balanced', () => {
    expect(isBalanced([...suns.slice(0, 2), ...moons.slice(0, 3)])).toBe(true)
    expect(isBalanced([...suns.slice(0, 3), ...moons.slice(0, 2)])).toBe(true)
  })

  it('a lopsided hand is not balanced', () => {
    expect(isBalanced([...suns.slice(0, 4), moons[0]])).toBe(false)
    expect(isBalanced([...suns.slice(0, 4), ...moons.slice(0, 1)])).toBe(false)
  })

  it('swapCard replaces exactly the named card with one from outside the hand', () => {
    const hand = drawHand(identity)
    const out = hand[0]
    const next = swapCard(hand, out.id, identity)
    expect(next).toHaveLength(HAND_SIZE)
    expect(next.map((c) => c.id)).not.toContain(out.id)
    expect(new Set(next.map((c) => c.id)).size).toBe(HAND_SIZE)
    // original hand untouched
    expect(hand[0].id).toBe(out.id)
  })
})

describe('jung motif reading', () => {
  it('gives a playful motif for a balanced hand', () => {
    const hand = [...suns.slice(0, 2), ...moons.slice(0, 3)]
    const motif = motifFor(hand)
    expect(motif).not.toBeNull()
    expect(motif!.length).toBeGreaterThan(0)
  })

  it('returns null for an unbalanced hand (keep drawing)', () => {
    expect(motifFor([...suns.slice(0, 4), moons[0]])).toBeNull()
  })
})
