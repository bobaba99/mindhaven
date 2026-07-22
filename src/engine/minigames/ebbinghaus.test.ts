import { describe, expect, it } from 'vitest'
import {
  FORGETTING_CURVE,
  SYLLABLE_TARGETS,
  buildRecallBank,
  retentionAt,
  scoreRecall,
  summarizeSavings,
} from './ebbinghaus'

const noShuffle = <T,>(arr: T[]): T[] => [...arr]

describe('Ebbinghaus forgetting-curve bakery', () => {
  it('uses the real 1885 retention data points, descending over time', () => {
    expect(FORGETTING_CURVE.length).toBeGreaterThanOrEqual(4)
    for (let i = 1; i < FORGETTING_CURVE.length; i++) {
      expect(FORGETTING_CURVE[i].hours).toBeGreaterThan(FORGETTING_CURVE[i - 1].hours)
      expect(FORGETTING_CURVE[i].retention).toBeLessThanOrEqual(
        FORGETTING_CURVE[i - 1].retention,
      )
    }
    // anchor points from the 1885 monograph
    const twentyMin = FORGETTING_CURVE.find((p) => p.hours < 0.5)
    expect(twentyMin?.retention).toBeCloseTo(0.58, 1)
  })

  it('retentionAt interpolates monotonically between curve points', () => {
    expect(retentionAt(0)).toBe(1)
    const r1 = retentionAt(1)
    const r9 = retentionAt(9)
    const r24 = retentionAt(24)
    expect(r1).toBeGreaterThan(r9)
    expect(r9).toBeGreaterThan(r24 - 1e-9)
    expect(r24).toBeGreaterThan(0)
    expect(retentionAt(10_000)).toBeGreaterThan(0) // never fully gone (savings!)
  })

  it('nonsense syllables are CVC trigrams, unique across targets and decoys', () => {
    const bank = buildRecallBank(noShuffle)
    const all = bank.map((b) => b.syllable)
    expect(new Set(all).size).toBe(all.length)
    for (const s of all) expect(s).toMatch(/^[B-DF-HJ-NP-TV-Z][AEIOU][B-DF-HJ-NP-TV-Z]$/)
    for (const t of SYLLABLE_TARGETS) {
      expect(bank.some((b) => b.syllable === t && b.isTarget)).toBe(true)
    }
  })

  it('scoreRecall counts hits and false alarms against the targets', () => {
    const perfect = scoreRecall(new Set(SYLLABLE_TARGETS))
    expect(perfect.hits).toBe(SYLLABLE_TARGETS.length)
    expect(perfect.falseAlarms).toBe(0)
    const wild = scoreRecall(new Set([...SYLLABLE_TARGETS, 'XOX']))
    expect(wild.falseAlarms).toBe(1)
    expect(scoreRecall(new Set()).hits).toBe(0)
  })

  it('summarizeSavings always mentions relearning savings', () => {
    for (const hits of [0, 2, 4]) {
      expect(summarizeSavings(hits)).toMatch(/savings|relearn/i)
    }
  })
})
