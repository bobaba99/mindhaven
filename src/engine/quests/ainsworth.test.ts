import { describe, expect, it } from 'vitest'
import {
  ATTACHMENT_LABELS,
  REUNION_ROUNDS,
  scoreReunion,
  summarizeReunions,
} from './ainsworth'

describe('Ainsworth reunion rounds', () => {
  it('covers all three classic attachment styles exactly once', () => {
    const styles = REUNION_ROUNDS.map((r) => r.correct)
    expect(styles).toHaveLength(3)
    expect(new Set(styles)).toEqual(new Set(['secure', 'avoidant', 'resistant']))
  })

  it('each round has a written vignette and a teaching read', () => {
    for (const r of REUNION_ROUNDS) {
      expect(r.vignette.length).toBeGreaterThan(40)
      expect(r.read.length).toBeGreaterThan(40)
      expect(ATTACHMENT_LABELS[r.correct].length).toBeGreaterThan(0)
    }
  })

  it('scores a correct classification', () => {
    const round = REUNION_ROUNDS[0]
    expect(scoreReunion(round, round.correct).correct).toBe(true)
  })

  it('scores an incorrect classification', () => {
    const round = REUNION_ROUNDS.find((r) => r.correct === 'secure')!
    expect(scoreReunion(round, 'avoidant').correct).toBe(false)
  })

  it('summarizes with the Baltimore-study framing at any score', () => {
    for (let n = 0; n <= REUNION_ROUNDS.length; n++) {
      const msg = summarizeReunions(n)
      expect(msg.length).toBeGreaterThan(40)
    }
  })
})
