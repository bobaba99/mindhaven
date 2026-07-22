import { describe, expect, it } from 'vitest'
import { BELONGING_ROUNDS, isConnectingChoice } from './adler'

describe('Adler belonging rounds', () => {
  it('has at least two rounds, each pairing two lonely townsfolk', () => {
    expect(BELONGING_ROUNDS.length).toBeGreaterThanOrEqual(2)
    for (const r of BELONGING_ROUNDS) {
      expect(r.personA.length).toBeGreaterThan(20)
      expect(r.personB.length).toBeGreaterThan(20)
      expect(r.options.length).toBeGreaterThanOrEqual(3)
      expect(r.options).toContain(r.correct)
      expect(r.why.length).toBeGreaterThan(40)
    }
  })

  it('round ids are unique', () => {
    const ids = BELONGING_ROUNDS.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('recognizes the connecting choice and rejects the others', () => {
    for (const r of BELONGING_ROUNDS) {
      expect(isConnectingChoice(r, r.correct)).toBe(true)
      for (const o of r.options) {
        if (o !== r.correct) expect(isConnectingChoice(r, o)).toBe(false)
      }
    }
  })
})
