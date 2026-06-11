import { beforeEach, describe, expect, it } from 'vitest'
import {
  TOUR_STORAGE_KEY,
  advanceTour,
  initialTour,
  isTourDone,
  markTourDone,
  stepCopy,
  stepIndex,
  TOUR_STEPS,
} from './tour'

beforeEach(() => {
  localStorage.clear()
})

describe('tour progression', () => {
  it('starts at the walk step, not completed', () => {
    expect(initialTour()).toEqual({ step: 'walk', completed: false })
  })

  it('advances through the happy path: walk → approach → enter → earn → done', () => {
    let s = initialTour()
    s = advanceTour(s, 'moved')
    expect(s.step).toBe('approach')
    s = advanceTour(s, 'neared')
    expect(s.step).toBe('enter')
    s = advanceTour(s, 'opened')
    expect(s.step).toBe('earn')
    s = advanceTour(s, 'earned')
    expect(s.step).toBe('done')
    expect(s.completed).toBe(true)
  })

  it('is rush-proof: a later event jumps the tour forward', () => {
    // Player ignores the toast, walks straight into a building.
    const s = advanceTour(initialTour(), 'opened')
    expect(s.step).toBe('earn')
  })

  it('never regresses on an earlier event', () => {
    let s = advanceTour(initialTour(), 'opened') // at earn
    s = advanceTour(s, 'moved')
    expect(s.step).toBe('earn')
  })

  it('skip completes immediately from any step', () => {
    const s = advanceTour(initialTour(), 'skip')
    expect(s.step).toBe('done')
    expect(s.completed).toBe(true)
  })

  it('returns the same state object when nothing changes', () => {
    const s = advanceTour(initialTour(), 'opened')
    expect(advanceTour(s, 'moved')).toBe(s)
  })
})

describe('tour persistence + copy', () => {
  it('persists the done flag', () => {
    expect(isTourDone()).toBe(false)
    markTourDone()
    expect(isTourDone()).toBe(true)
    expect(localStorage.getItem(TOUR_STORAGE_KEY)).toBe('1')
  })

  it('treats corrupt storage as not-done', () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'banana')
    expect(isTourDone()).toBe(false)
  })

  it('has guidance copy for every teaching step', () => {
    for (const step of TOUR_STEPS) {
      if (step === 'done') continue
      const copy = stepCopy(step)
      expect(copy.title.length).toBeGreaterThan(0)
      expect(copy.body.length).toBeGreaterThan(0)
    }
  })

  it('orders steps for the progress dots', () => {
    expect(stepIndex('walk')).toBe(0)
    expect(stepIndex('earn')).toBe(3)
    expect(stepIndex('done')).toBe(4)
  })
})
