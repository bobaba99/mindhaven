import { describe, expect, it } from 'vitest'
import { ALL_BUILDINGS, BUILDINGS, LANE_BUILDINGS } from './buildings'

describe('town building data', () => {
  it('ALL_BUILDINGS is Main Street then Memory Lane, orders strictly ascending', () => {
    expect(ALL_BUILDINGS).toHaveLength(BUILDINGS.length + LANE_BUILDINGS.length)
    ALL_BUILDINGS.forEach((b, i) => expect(b.order).toBe(i + 1))
  })

  it('every id and lecture id is unique town-wide', () => {
    const ids = ALL_BUILDINGS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
    const lectureIds = ALL_BUILDINGS.flatMap((b) => b.lectures.map((l) => l.id))
    expect(new Set(lectureIds).size).toBe(lectureIds.length)
  })

  it('every building is fully written: intro, hook, three lectures with blurbs', () => {
    for (const b of ALL_BUILDINGS) {
      expect(b.intro.length).toBeGreaterThan(80)
      expect(b.hookDescription.length).toBeGreaterThan(30)
      expect(b.lectures).toHaveLength(3)
      for (const l of b.lectures) {
        expect(l.title.length).toBeGreaterThan(0)
        expect(l.blurb.length).toBeGreaterThan(120)
      }
    }
  })

  it('Memory Lane gates escalate beyond Main Street and start at the street gate (90)', () => {
    const mainMax = Math.max(...BUILDINGS.map((b) => b.unlockCost))
    expect(LANE_BUILDINGS[0].unlockCost).toBe(90)
    for (let i = 0; i < LANE_BUILDINGS.length; i++) {
      expect(LANE_BUILDINGS[i].unlockCost).toBeGreaterThan(mainMax)
      if (i > 0) {
        expect(LANE_BUILDINGS[i].unlockCost).toBeGreaterThan(
          LANE_BUILDINGS[i - 1].unlockCost,
        )
      }
    }
  })

  it('lane hooks use the three new memory minigames', () => {
    expect(LANE_BUILDINGS.map((b) => b.hookKind)).toEqual([
      'ebbinghaus-recall',
      'bartlett-swap',
      'sperling-flash',
    ])
  })
})
