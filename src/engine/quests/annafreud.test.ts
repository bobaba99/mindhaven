import { describe, expect, it } from 'vitest'
import {
  DEFENSE_CARDS,
  buildDefenseRounds,
  isCorrectDefense,
} from './annafreud'

/** Identity "shuffle" keeps tests deterministic. */
const noShuffle = <T,>(arr: T[]): T[] => [...arr]

describe("Anna Freud's defense-mechanism cards", () => {
  it('has at least four cards with distinct mechanisms', () => {
    expect(DEFENSE_CARDS.length).toBeGreaterThanOrEqual(4)
    const mechanisms = DEFENSE_CARDS.map((c) => c.mechanism)
    expect(new Set(mechanisms).size).toBe(mechanisms.length)
  })

  it('every card pairs a scenario with a mechanism and a teaching note', () => {
    for (const c of DEFENSE_CARDS) {
      expect(c.scenario.length).toBeGreaterThan(30)
      expect(c.mechanism.length).toBeGreaterThan(0)
      expect(c.note.length).toBeGreaterThan(30)
    }
  })

  it('builds one round per card with every mechanism offered as an option', () => {
    const rounds = buildDefenseRounds(noShuffle)
    expect(rounds).toHaveLength(DEFENSE_CARDS.length)
    for (const r of rounds) {
      expect(r.options).toHaveLength(DEFENSE_CARDS.length)
      expect(r.options).toContain(r.card.mechanism)
    }
  })

  it('isCorrectDefense matches only the card’s own mechanism', () => {
    for (const c of DEFENSE_CARDS) {
      expect(isCorrectDefense(c.id, c.mechanism)).toBe(true)
      const wrong = DEFENSE_CARDS.find((o) => o.id !== c.id)!.mechanism
      expect(isCorrectDefense(c.id, wrong)).toBe(false)
    }
    expect(isCorrectDefense('no-such-card', DEFENSE_CARDS[0].mechanism)).toBe(false)
  })
})
