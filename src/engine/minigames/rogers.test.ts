import { describe, expect, it } from 'vitest'
import {
  GUESTS,
  REGARD_TO_SUCCEED,
  explainFor,
  initialRogers,
  isWarmWelcome,
  respond,
} from './rogers'

const reflectiveOf = (guestIdx: number) =>
  GUESTS[guestIdx].options.find((o) => o.kind === 'reflective')!
const judgmentalOf = (guestIdx: number) =>
  GUESTS[guestIdx].options.find((o) => o.kind === 'judgmental')!

describe('rogers guestbook data', () => {
  it('has at least four guests with unique ids', () => {
    expect(GUESTS.length).toBeGreaterThanOrEqual(4)
    expect(new Set(GUESTS.map((g) => g.id)).size).toBe(GUESTS.length)
  })

  it('every guest offers exactly one reflective option among three kinds', () => {
    for (const g of GUESTS) {
      expect(g.options.length).toBeGreaterThanOrEqual(3)
      expect(g.options.filter((o) => o.kind === 'reflective')).toHaveLength(1)
      expect(g.options.filter((o) => o.kind === 'directive').length).toBeGreaterThanOrEqual(1)
      expect(g.options.filter((o) => o.kind === 'judgmental').length).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('rogers responding', () => {
  it('a reflective response raises regard and is recorded', () => {
    const s = respond(initialRogers(), GUESTS[0].id, reflectiveOf(0).id)
    expect(s.regard).toBe(1)
    expect(s.answered[GUESTS[0].id]).toBe('reflective')
  })

  it('a judgmental response is recorded but earns no regard', () => {
    const s = respond(initialRogers(), GUESTS[0].id, judgmentalOf(0).id)
    expect(s.regard).toBe(0)
    expect(s.answered[GUESTS[0].id]).toBe('judgmental')
  })

  it('a guest can only be answered once', () => {
    const once = respond(initialRogers(), GUESTS[0].id, judgmentalOf(0).id)
    const twice = respond(once, GUESTS[0].id, reflectiveOf(0).id)
    expect(twice).toBe(once)
  })

  it('warm welcome unlocks at REGARD_TO_SUCCEED reflective responses', () => {
    let s = initialRogers()
    expect(isWarmWelcome(s)).toBe(false)
    for (let i = 0; i < REGARD_TO_SUCCEED; i++) {
      s = respond(s, GUESTS[i].id, reflectiveOf(i).id)
    }
    expect(isWarmWelcome(s)).toBe(true)
  })

  it('explains each response kind for the teaching beat', () => {
    expect(explainFor('reflective')).toMatch(/reflect|hear|empath/i)
    expect(explainFor('directive').length).toBeGreaterThan(0)
    expect(explainFor('judgmental').length).toBeGreaterThan(0)
  })

  it('never mutates the input state', () => {
    const s = initialRogers()
    respond(s, GUESTS[0].id, reflectiveOf(0).id)
    expect(s).toEqual(initialRogers())
  })
})
