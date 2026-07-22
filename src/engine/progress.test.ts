import { beforeEach, describe, expect, it } from 'vitest'
import { BUILDINGS, TOWNSFOLK } from '../data/buildings'
import {
  INSIGHT_PER_INTRO,
  INSIGHT_PER_LECTURE,
  INSIGHT_PER_QUEST,
  TOTAL_LECTURES,
  defaultProgress,
  loadProgress,
  saveProgress,
  markVisited,
  markLectureComplete,
  markQuestComplete,
  unlockBuilding,
  meetsUnlockThreshold,
  unlockCostFor,
  isUnlocked,
} from './progress'

const STORAGE_KEY = 'mindhaven.progress.v1'
const firstGated = BUILDINGS.find((b) => b.unlockCost > 0)!

describe('defaultProgress', () => {
  it('opens exactly the free (cost 0) buildings and nothing else', () => {
    const p = defaultProgress()
    const free = BUILDINGS.filter((b) => b.unlockCost === 0).map((b) => b.id)
    expect(p.unlockedBuildings.sort()).toEqual(free.sort())
    expect(p.insight).toBe(0)
    expect(p.completedLectures).toEqual([])
    expect(p.visitedBuildings).toEqual([])
    expect(p.completedQuests).toEqual([])
  })
})

describe('townsfolk quest completion (v1.3)', () => {
  const folkId = TOWNSFOLK[0].id

  it('markQuestComplete grants quest insight once and is idempotent', () => {
    const a1 = markQuestComplete(defaultProgress(), folkId)
    expect(a1.insight).toBe(INSIGHT_PER_QUEST)
    expect(a1.completedQuests).toEqual([folkId])
    expect(markQuestComplete(a1, folkId)).toBe(a1)
  })

  it('does not mutate the input state', () => {
    const p = defaultProgress()
    const frozen = JSON.stringify(p)
    markQuestComplete(p, folkId)
    expect(JSON.stringify(p)).toBe(frozen)
  })

  it('persists and reloads completed quests', () => {
    localStorage.clear()
    saveProgress(markQuestComplete(defaultProgress(), folkId))
    expect(loadProgress().completedQuests).toEqual([folkId])
  })

  it('drops unknown quest ids injected into storage', () => {
    localStorage.clear()
    localStorage.setItem(
      'mindhaven.progress.v1',
      JSON.stringify({ completedQuests: ['ghost-wanderer', folkId] }),
    )
    expect(loadProgress().completedQuests).toEqual([folkId])
  })

  it('loads pre-v1.3 saves (no completedQuests field) as an empty list', () => {
    localStorage.clear()
    localStorage.setItem('mindhaven.progress.v1', JSON.stringify({ insight: 12 }))
    const p = loadProgress()
    expect(p.insight).toBe(12)
    expect(p.completedQuests).toEqual([])
  })
})

describe('insight accrual reducers', () => {
  it('markVisited grants intro insight once and is idempotent', () => {
    const b = BUILDINGS[0].id
    const a1 = markVisited(defaultProgress(), b)
    expect(a1.insight).toBe(INSIGHT_PER_INTRO)
    expect(a1.visitedBuildings).toContain(b)
    const a2 = markVisited(a1, b)
    expect(a2).toBe(a1) // same reference: no change on repeat
    expect(a2.insight).toBe(INSIGHT_PER_INTRO)
  })

  it('markLectureComplete grants lecture insight once and is idempotent', () => {
    const lid = BUILDINGS[0].lectures[0].id
    const a1 = markLectureComplete(defaultProgress(), lid)
    expect(a1.insight).toBe(INSIGHT_PER_LECTURE)
    expect(a1.completedLectures).toEqual([lid])
    expect(markLectureComplete(a1, lid)).toBe(a1)
  })

  it('does not mutate the input state', () => {
    const p = defaultProgress()
    const frozen = JSON.stringify(p)
    markVisited(p, BUILDINGS[0].id)
    markLectureComplete(p, BUILDINGS[0].lectures[0].id)
    expect(JSON.stringify(p)).toBe(frozen)
  })
})

describe('unlock gating (threshold, NOT a spend)', () => {
  it('refuses to unlock below threshold', () => {
    const p = defaultProgress() // 0 insight
    const after = unlockBuilding(p, firstGated.id)
    expect(after).toBe(p)
    expect(isUnlocked(after, firstGated.id)).toBe(false)
  })

  it('unlocks at/above threshold and does NOT deduct insight', () => {
    const cost = unlockCostFor(firstGated.id)
    const p = { ...defaultProgress(), insight: cost }
    expect(meetsUnlockThreshold(p, firstGated.id)).toBe(true)
    const after = unlockBuilding(p, firstGated.id)
    expect(isUnlocked(after, firstGated.id)).toBe(true)
    // Insight is a cumulative score: unlocking must not reduce it.
    expect(after.insight).toBe(cost)
  })

  it('lets the player keep banking toward later escalating gates', () => {
    const gated = BUILDINGS.filter((b) => b.unlockCost > 0)
    const maxGate = Math.max(...gated.map((b) => b.unlockCost))
    let p = { ...defaultProgress(), insight: maxGate }
    for (const b of gated) p = unlockBuilding(p, b.id)
    // every gate reachable from a single banked total, because none were spent
    for (const b of gated) expect(isUnlocked(p, b.id)).toBe(true)
    expect(p.insight).toBe(maxGate)
  })

  it('is idempotent on an already-unlocked building', () => {
    const free = BUILDINGS.find((b) => b.unlockCost === 0)!
    const p = defaultProgress()
    expect(unlockBuilding(p, free.id)).toBe(p)
  })
})

describe('TOTAL_LECTURES', () => {
  it('counts every lecture across all buildings', () => {
    const manual = BUILDINGS.reduce((n, b) => n + b.lectures.length, 0)
    expect(TOTAL_LECTURES).toBe(manual)
    expect(TOTAL_LECTURES).toBeGreaterThan(0)
  })
})

describe('loadProgress hardening', () => {
  beforeEach(() => localStorage.clear())

  it('returns defaults when nothing is stored', () => {
    expect(loadProgress()).toEqual(defaultProgress())
  })

  it('round-trips a valid saved state', () => {
    const lid = BUILDINGS[0].lectures[0].id
    const saved = markLectureComplete(markVisited(defaultProgress(), BUILDINGS[0].id), lid)
    saveProgress(saved)
    const loaded = loadProgress()
    expect(loaded.insight).toBe(saved.insight)
    expect(loaded.completedLectures).toEqual(saved.completedLectures)
    expect(loaded.visitedBuildings).toEqual(saved.visitedBuildings)
  })

  it('clamps a negative / non-finite / non-number insight to 0', () => {
    for (const bad of [-50, Number.NaN, Infinity, 'lots', null]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ insight: bad }))
      expect(loadProgress().insight).toBe(0)
    }
  })

  it('floors a fractional insight', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ insight: 7.9 }))
    expect(loadProgress().insight).toBe(7)
  })

  it('drops unknown building / lecture ids injected into storage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        insight: 5,
        completedLectures: ['not-a-real-lecture', BUILDINGS[0].lectures[0].id],
        visitedBuildings: ['ghost-shop', BUILDINGS[0].id],
        unlockedBuildings: ['ghost-shop', firstGated.id],
      }),
    )
    const p = loadProgress()
    expect(p.completedLectures).toEqual([BUILDINGS[0].lectures[0].id])
    expect(p.visitedBuildings).toEqual([BUILDINGS[0].id])
    expect(p.unlockedBuildings).not.toContain('ghost-shop')
    expect(p.unlockedBuildings).toContain(firstGated.id)
  })

  it('always keeps the free buildings unlocked even if storage omits them', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unlockedBuildings: [] }))
    const free = BUILDINGS.filter((b) => b.unlockCost === 0).map((b) => b.id)
    const p = loadProgress()
    for (const id of free) expect(p.unlockedBuildings).toContain(id)
  })

  it('survives malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json at all')
    expect(loadProgress()).toEqual(defaultProgress())
  })

  it('survives a non-object JSON payload', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]))
    expect(loadProgress()).toEqual(defaultProgress())
  })
})
