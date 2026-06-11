import { describe, expect, it } from 'vitest'
import { ASCH_ROUNDS, scoreChoice, summarizeAsch } from './asch'

describe('asch round data', () => {
  it('marks the option matching the standard line as correct', () => {
    for (const r of ASCH_ROUNDS) {
      expect(r.options[r.correct]).toBe(r.standard)
    }
  })

  it('the group answers wrongly only on critical rounds', () => {
    for (const r of ASCH_ROUNDS) {
      if (r.critical) expect(r.groupAnswer).not.toBe(r.correct)
      else expect(r.groupAnswer).toBe(r.correct)
    }
  })

  it('stages at least one neutral warmup and two critical rounds', () => {
    expect(ASCH_ROUNDS.filter((r) => !r.critical).length).toBeGreaterThanOrEqual(1)
    expect(ASCH_ROUNDS.filter((r) => r.critical).length).toBeGreaterThanOrEqual(2)
  })
})

describe('asch scoring', () => {
  const critical = ASCH_ROUNDS.find((r) => r.critical)!
  const neutral = ASCH_ROUNDS.find((r) => !r.critical)!

  it('echoing the wrong majority on a critical round counts as conformity', () => {
    const res = scoreChoice(critical, critical.groupAnswer)
    expect(res.conformed).toBe(true)
    expect(res.independent).toBe(false)
    expect(res.correct).toBe(false)
  })

  it('trusting your eyes on a critical round counts as independence', () => {
    const res = scoreChoice(critical, critical.correct)
    expect(res.independent).toBe(true)
    expect(res.conformed).toBe(false)
    expect(res.correct).toBe(true)
  })

  it('neutral rounds never count as conformity', () => {
    const res = scoreChoice(neutral, neutral.groupAnswer)
    expect(res.conformed).toBe(false)
  })

  it('summarizes conformity vs independence with distinct messages', () => {
    const allConform = ASCH_ROUNDS.map((r) =>
      scoreChoice(r, r.critical ? r.groupAnswer : r.correct),
    )
    const allIndependent = ASCH_ROUNDS.map((r) => scoreChoice(r, r.correct))
    const a = summarizeAsch(allConform)
    const b = summarizeAsch(allIndependent)
    expect(a.conformed).toBeGreaterThan(0)
    expect(b.conformed).toBe(0)
    expect(b.independent).toBeGreaterThan(0)
    expect(a.message).not.toBe(b.message)
  })
})
