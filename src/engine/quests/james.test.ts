import { describe, expect, it } from 'vitest'
import { WISPS, wispPosition, allCaught } from './james'

describe('James stream-of-consciousness wisps', () => {
  it('has exactly three wisps, each with a fragment and a changed echo', () => {
    expect(WISPS).toHaveLength(3)
    for (const w of WISPS) {
      expect(w.fragment.length).toBeGreaterThan(10)
      expect(w.echo.length).toBeGreaterThan(10)
      expect(w.echo).not.toBe(w.fragment)
    }
  })

  it('wisp positions stay inside the unit square at all times', () => {
    for (let i = 0; i < WISPS.length; i++) {
      for (let t = 0; t < 30; t += 0.25) {
        const { x, y } = wispPosition(i, t)
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(1)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(y).toBeLessThanOrEqual(1)
      }
    }
  })

  it('wisps actually drift (position changes over time)', () => {
    const a = wispPosition(0, 0)
    const b = wispPosition(0, 2)
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0.01)
  })

  it('wisps follow distinct paths', () => {
    const a = wispPosition(0, 1)
    const b = wispPosition(1, 1)
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0.05)
  })

  it('is deterministic for a given index and time', () => {
    expect(wispPosition(2, 7.5)).toEqual(wispPosition(2, 7.5))
  })

  it('allCaught requires every wisp id', () => {
    expect(allCaught(new Set())).toBe(false)
    expect(allCaught(new Set(WISPS.map((w) => w.id).slice(0, 2)))).toBe(false)
    expect(allCaught(new Set(WISPS.map((w) => w.id)))).toBe(true)
  })
})
