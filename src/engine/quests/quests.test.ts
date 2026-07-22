import { describe, expect, it } from 'vitest'
import { TOWNSFOLK } from '../../data/buildings'
import { QUESTS, questFor } from './quests'

describe('townsfolk quest registry', () => {
  it('has exactly one quest per townsperson, keyed by their id', () => {
    expect(QUESTS).toHaveLength(TOWNSFOLK.length)
    const folkIds = new Set(TOWNSFOLK.map((t) => t.id))
    for (const q of QUESTS) {
      expect(folkIds.has(q.id)).toBe(true)
    }
    expect(new Set(QUESTS.map((q) => q.id)).size).toBe(QUESTS.length)
  })

  it('every quest is fully written: title, teaser, greeting', () => {
    for (const q of QUESTS) {
      expect(q.title.length).toBeGreaterThan(0)
      expect(q.teaser.length).toBeGreaterThan(10)
      expect(q.greeting.length).toBeGreaterThan(40)
    }
  })

  it('questFor finds quests by townsperson id and rejects unknowns', () => {
    expect(questFor('mary-ainsworth')?.id).toBe('mary-ainsworth')
    expect(questFor('nobody-here')).toBeUndefined()
  })
})
