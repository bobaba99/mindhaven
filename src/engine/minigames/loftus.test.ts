import { describe, expect, it } from 'vitest'
import {
  QUESTIONS,
  SCENE_FACTS,
  countPlanted,
  evaluateAnswer,
  memorySummary,
} from './loftus'

describe('loftus scene + question data', () => {
  it('describes the witnessed scene with at least three facts', () => {
    expect(SCENE_FACTS.length).toBeGreaterThanOrEqual(3)
  })

  it('has unique question ids whose planted/correct ids reference real options', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length)
    for (const q of QUESTIONS) {
      const optionIds = q.options.map((o) => o.id)
      for (const planted of q.plantedIds) expect(optionIds).toContain(planted)
      if (q.correctId !== null) expect(optionIds).toContain(q.correctId)
    }
  })

  it('includes at least one leading question (the misinformation vehicle)', () => {
    expect(QUESTIONS.some((q) => q.leading)).toBe(true)
  })

  it('every question carries a reveal for the debrief', () => {
    for (const q of QUESTIONS) expect(q.reveal.length).toBeGreaterThan(0)
  })
})

describe('loftus answer evaluation', () => {
  it('flags planted choices as misinformation accepted', () => {
    const q = QUESTIONS.find((x) => x.plantedIds.length > 0)!
    const res = evaluateAnswer(q.id, q.plantedIds[0])
    expect(res.planted).toBe(true)
  })

  it('marks the true-detail choice as correct and unplanted', () => {
    const q = QUESTIONS.find((x) => x.correctId !== null)!
    const res = evaluateAnswer(q.id, q.correctId!)
    expect(res.planted).toBe(false)
    expect(res.correct).toBe(true)
  })

  it('counts planted answers across the whole interview', () => {
    const answers: Record<string, string> = {}
    for (const q of QUESTIONS) {
      answers[q.id] = q.plantedIds[0] ?? q.options[0].id
    }
    const planted = countPlanted(answers)
    const expected = QUESTIONS.filter((q) => q.plantedIds.length > 0).length
    expect(planted).toBe(expected)
  })

  it('summarizes differently for a clean vs. contaminated memory', () => {
    expect(memorySummary(0)).not.toBe(memorySummary(2))
    expect(memorySummary(0).length).toBeGreaterThan(0)
    expect(memorySummary(2).length).toBeGreaterThan(0)
  })
})
