import { describe, expect, it } from 'vitest'
import { BUILDINGS, LANE_BUILDINGS } from '../data/buildings'
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
  LANE_PLACEMENTS,
  LANE_WORLD_COLS,
  LANE_WORLD_W,
  GATE_COL,
  GATE_W_TILES,
  GATE_DOOR_X,
  LANE_UNLOCK_COST,
  layoutFor,
  spawnXFor,
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

describe('Memory Lane district (v1.4)', () => {
  it('lays out one placement per lane building inside the lane bounds', () => {
    expect(LANE_PLACEMENTS).toHaveLength(LANE_BUILDINGS.length)
    LANE_PLACEMENTS.forEach((pl, i) => expect(pl.id).toBe(LANE_BUILDINGS[i].id))
    const last = LANE_PLACEMENTS[LANE_PLACEMENTS.length - 1]
    expect(last.col + last.widthTiles).toBeLessThanOrEqual(
      LANE_WORLD_COLS - EDGE_MARGIN_TILES,
    )
    expect(LANE_WORLD_W).toBe(LANE_WORLD_COLS * TILE)
    expect(LANE_WORLD_W).toBeLessThan(WORLD_W) // the lane is the SHORT street
  })

  it('layoutFor returns matching district layouts', () => {
    expect(layoutFor('main').placements).toBe(PLACEMENTS)
    expect(layoutFor('main').worldW).toBe(WORLD_W)
    expect(layoutFor('lane').placements).toBe(LANE_PLACEMENTS)
    expect(layoutFor('lane').buildings).toBe(LANE_BUILDINGS)
  })

  it('puts the gate exactly in the gap between the 2nd and 3rd facades', () => {
    const calkins = PLACEMENTS[1]
    const pavlov = PLACEMENTS[2]
    expect(GATE_COL).toBe(calkins.col + calkins.widthTiles)
    expect(GATE_COL + GATE_W_TILES).toBe(pavlov.col)
    // door point centered in the gap
    expect(GATE_DOOR_X).toBe((GATE_COL + GATE_W_TILES / 2) * TILE)
  })

  it('gate threshold matches the roadmap: 90 ◆, and lane gates start there', () => {
    expect(LANE_UNLOCK_COST).toBe(90)
    expect(LANE_BUILDINGS[0].unlockCost).toBe(LANE_UNLOCK_COST)
  })

  it('spawn points: lane entrance, gate return, fresh start', () => {
    expect(spawnXFor('lane', 'main')).toBeLessThan(LANE_WORLD_W / 4)
    expect(spawnXFor('main', 'lane')).toBeCloseTo(GATE_DOOR_X - TILE / 2)
    expect(spawnXFor('main', null)).toBe(TILE * 1.5)
  })
})
