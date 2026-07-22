import { describe, expect, it } from 'vitest'
import {
  DISSONANCE_LINES,
  scoreFlags,
  summarizeDissonance,
} from './festinger'

describe('Festinger dissonance errand', () => {
  it('mixes rationalizations with plain facts (at least two of each)', () => {
    const rats = DISSONANCE_LINES.filter((l) => l.rationalization)
    const facts = DISSONANCE_LINES.filter((l) => !l.rationalization)
    expect(rats.length).toBeGreaterThanOrEqual(2)
    expect(facts.length).toBeGreaterThanOrEqual(2)
  })

  it('every line carries a tell explaining its classification', () => {
    for (const l of DISSONANCE_LINES) {
      expect(l.text.length).toBeGreaterThan(10)
      expect(l.tell.length).toBeGreaterThan(20)
      expect(typeof l.rationalization).toBe('boolean')
    }
  })

  it('perfect flagging scores full hits, no misses, no false alarms', () => {
    const rats = DISSONANCE_LINES.filter((l) => l.rationalization).map((l) => l.id)
    const score = scoreFlags(new Set(rats))
    expect(score.hits).toBe(rats.length)
    expect(score.misses).toBe(0)
    expect(score.falseAlarms).toBe(0)
  })

  it('flagging everything produces false alarms; flagging nothing produces misses', () => {
    const all = scoreFlags(new Set(DISSONANCE_LINES.map((l) => l.id)))
    expect(all.falseAlarms).toBe(
      DISSONANCE_LINES.filter((l) => !l.rationalization).length,
    )
    const none = scoreFlags(new Set())
    expect(none.misses).toBe(
      DISSONANCE_LINES.filter((l) => l.rationalization).length,
    )
  })

  it('summary references the 1959 dollar experiment', () => {
    const score = scoreFlags(new Set())
    expect(summarizeDissonance(score)).toMatch(/1959|\$1|\$20|dollar/i)
  })
})
