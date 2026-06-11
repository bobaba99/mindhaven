import { describe, expect, it } from 'vitest'
import { DREAM_SYMBOLS, buildFreudRounds, isCorrectInterpretation } from './freud'

const identity = <T>(arr: T[]): T[] => [...arr]

describe('freud dream-symbol data', () => {
  it('offers at least four symbols with unique ids', () => {
    expect(DREAM_SYMBOLS.length).toBeGreaterThanOrEqual(4)
    const ids = new Set(DREAM_SYMBOLS.map((s) => s.id))
    expect(ids.size).toBe(DREAM_SYMBOLS.length)
  })

  it('every symbol has a latent reading and two distinct decoys', () => {
    for (const s of DREAM_SYMBOLS) {
      expect(s.latent.length).toBeGreaterThan(0)
      expect(s.decoys).toHaveLength(2)
      expect(new Set([s.latent, ...s.decoys]).size).toBe(3)
    }
  })
})

describe('freud interpretation matching', () => {
  it('accepts the latent interpretation for its own symbol', () => {
    for (const s of DREAM_SYMBOLS) {
      expect(isCorrectInterpretation(s.id, s.latent)).toBe(true)
    }
  })

  it('rejects decoy interpretations', () => {
    for (const s of DREAM_SYMBOLS) {
      for (const d of s.decoys) {
        expect(isCorrectInterpretation(s.id, d)).toBe(false)
      }
    }
  })

  it('rejects interpretations for unknown symbols', () => {
    expect(isCorrectInterpretation('not-a-symbol', 'anything')).toBe(false)
  })

  it('builds one round per symbol, each offering all three readings', () => {
    const rounds = buildFreudRounds(identity)
    expect(rounds).toHaveLength(DREAM_SYMBOLS.length)
    for (const r of rounds) {
      expect(r.options).toHaveLength(3)
      expect(r.options).toContain(r.symbol.latent)
      for (const d of r.symbol.decoys) expect(r.options).toContain(d)
    }
  })
})
