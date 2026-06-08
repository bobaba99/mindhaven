import { describe, expect, it } from 'vitest'
import { BUILDINGS } from '../data/buildings'
import {
  PLACEMENTS,
  computePlacements,
  BUILDING_TILES_W,
  BUILDING_GAP,
  EDGE_MARGIN_TILES,
  WORLD_COLS,
  WORLD_W,
  WORLD_H,
  TILE,
  WORLD_ROWS,
} from './world'

describe('computePlacements', () => {
  it('produces exactly one placement per building, in order', () => {
    expect(PLACEMENTS).toHaveLength(BUILDINGS.length)
    PLACEMENTS.forEach((pl, i) => expect(pl.id).toBe(BUILDINGS[i].id))
  })

  it('is deterministic (pure)', () => {
    expect(computePlacements()).toEqual(PLACEMENTS)
  })

  it('lays buildings out strictly left-to-right with no overlap', () => {
    for (let i = 1; i < PLACEMENTS.length; i++) {
      const prev = PLACEMENTS[i - 1]
      const cur = PLACEMENTS[i]
      // current starts after previous ends + the gap
      expect(cur.col).toBe(prev.col + BUILDING_TILES_W + BUILDING_GAP)
      expect(cur.col).toBeGreaterThan(prev.col + prev.widthTiles - 1)
    }
  })

  it('places the door inside each facade', () => {
    for (const pl of PLACEMENTS) {
      expect(pl.doorCol).toBeGreaterThanOrEqual(pl.col)
      expect(pl.doorCol).toBeLessThan(pl.col + pl.widthTiles)
    }
  })

  it('keeps every building within the world bounds incl. edge margin', () => {
    const first = PLACEMENTS[0]
    const last = PLACEMENTS[PLACEMENTS.length - 1]
    expect(first.col).toBe(EDGE_MARGIN_TILES)
    expect(last.col + last.widthTiles).toBeLessThanOrEqual(WORLD_COLS - EDGE_MARGIN_TILES)
  })

  it('derives world pixel size from tiles consistently', () => {
    expect(WORLD_W).toBe(WORLD_COLS * TILE)
    expect(WORLD_H).toBe(WORLD_ROWS * TILE)
  })
})
