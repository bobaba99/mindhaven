import { describe, expect, it } from 'vitest'
import {
  MOVES,
  ROUNDS_TO_MASTER,
  checkReproduction,
  efficacyGain,
  generateSequence,
  sequenceLengthFor,
} from './bandura'

describe('bandura sequence model', () => {
  it('round sequences grow one move per round, starting at three', () => {
    expect(sequenceLengthFor(1)).toBe(3)
    expect(sequenceLengthFor(2)).toBe(4)
    expect(sequenceLengthFor(3)).toBe(5)
  })

  it('generates sequences of the requested length using only legal moves', () => {
    const rng = () => 0.42
    const seq = generateSequence(5, rng)
    expect(seq).toHaveLength(5)
    for (const m of seq) expect(MOVES).toContain(m)
  })

  it('is deterministic for a fixed rng', () => {
    let i = 0
    const mkRng = () => {
      i = 0
      return () => {
        i += 1
        return (i * 0.31) % 1
      }
    }
    expect(generateSequence(4, mkRng())).toEqual(generateSequence(4, mkRng()))
  })

  it('judges an attempt: pending while a correct prefix, fail on any wrong move', () => {
    const target = [MOVES[0], MOVES[1], MOVES[2]]
    expect(checkReproduction(target, [])).toBe('pending')
    expect(checkReproduction(target, [MOVES[0]])).toBe('pending')
    expect(checkReproduction(target, [MOVES[0], MOVES[3]])).toBe('fail')
    expect(checkReproduction(target, [MOVES[1]])).toBe('fail')
  })

  it('judges success only on an exact full reproduction', () => {
    const target = [MOVES[2], MOVES[0]]
    expect(checkReproduction(target, [MOVES[2], MOVES[0]])).toBe('success')
    expect(checkReproduction(target, [MOVES[2], MOVES[0], MOVES[0]])).toBe('fail')
  })

  it('grants growing self-efficacy per mastered round', () => {
    expect(efficacyGain(1)).toBeGreaterThan(0)
    expect(efficacyGain(2)).toBeGreaterThan(efficacyGain(1))
    expect(ROUNDS_TO_MASTER).toBeGreaterThanOrEqual(2)
  })
})
