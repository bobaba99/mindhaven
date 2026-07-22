import { BUILDINGS, LANE_BUILDINGS } from '../data/buildings'
import type { Building } from '../data/types'

/**
 * World layout. The town has two districts, each a horizontal street: Main
 * Street (Wundt Way, 14 facades) and Memory Lane (3 facades, reached through
 * a gate that "branches north" between Calkins' and Pavlov's). Both share the
 * same vertical band structure; only the column count differs. All units are
 * TILES; the renderer multiplies by TILE * SCALE for pixels.
 */

export type District = 'main' | 'lane'

export const TILE = 16 // internal pixels per tile
export const SCALE = 3 // integer upscale for crisp pixel art

/** Each building occupies this many tiles of street frontage + a gap. */
export const BUILDING_TILES_W = 7
export const BUILDING_GAP = 2
export const BUILDING_TILES_H = 6

/** Vertical bands (in tiles). */
export const SKY_ROWS = 2
export const BUILDING_TOP_ROW = SKY_ROWS // buildings start drawing here
export const STREET_ROW = BUILDING_TOP_ROW + BUILDING_TILES_H // walkable path top
export const STREET_ROWS = 5
export const GRASS_BOTTOM_ROWS = 2

export const WORLD_ROWS =
  SKY_ROWS + BUILDING_TILES_H + STREET_ROWS + GRASS_BOTTOM_ROWS

/** Leading + trailing margin of grass before the first / after the last shop. */
export const EDGE_MARGIN_TILES = 3

export const WORLD_COLS =
  EDGE_MARGIN_TILES * 2 +
  BUILDINGS.length * BUILDING_TILES_W +
  (BUILDINGS.length - 1) * BUILDING_GAP

export interface BuildingPlacement {
  /** Building id. */
  id: string
  /** Left tile column of the facade. */
  col: number
  /** Top tile row of the facade. */
  row: number
  widthTiles: number
  heightTiles: number
  /** Tile column of the door (center-ish). */
  doorCol: number
  /** The row just below the building where the player stands to interact. */
  doorRow: number
}

/** Compute deterministic left->right placements for a row of buildings. */
export function computePlacementsFor(buildings: Building[]): BuildingPlacement[] {
  return buildings.map((b, i) => {
    const col =
      EDGE_MARGIN_TILES + i * (BUILDING_TILES_W + BUILDING_GAP)
    const doorCol = col + Math.floor(BUILDING_TILES_W / 2)
    return {
      id: b.id,
      col,
      row: BUILDING_TOP_ROW,
      widthTiles: BUILDING_TILES_W,
      heightTiles: BUILDING_TILES_H,
      doorCol,
      doorRow: STREET_ROW, // first walkable row beneath the facade
    }
  })
}

/** @deprecated main-street helper kept for existing callers/tests. */
export function computePlacements(): BuildingPlacement[] {
  return computePlacementsFor(BUILDINGS)
}

export const PLACEMENTS = computePlacementsFor(BUILDINGS)

/** Pixel dimensions of the whole world (pre-scale). */
export const WORLD_W = WORLD_COLS * TILE
export const WORLD_H = WORLD_ROWS * TILE

// ---------- Memory Lane (v1.4) ----------

export const LANE_WORLD_COLS =
  EDGE_MARGIN_TILES * 2 +
  LANE_BUILDINGS.length * BUILDING_TILES_W +
  (LANE_BUILDINGS.length - 1) * BUILDING_GAP

export const LANE_PLACEMENTS = computePlacementsFor(LANE_BUILDINGS)
export const LANE_WORLD_W = LANE_WORLD_COLS * TILE

/** Everything a renderer/simulation needs to know about one district. */
export interface DistrictLayout {
  district: District
  buildings: Building[]
  cols: number
  worldW: number
  placements: BuildingPlacement[]
}

const MAIN_LAYOUT: DistrictLayout = {
  district: 'main',
  buildings: BUILDINGS,
  cols: WORLD_COLS,
  worldW: WORLD_W,
  placements: PLACEMENTS,
}

const LANE_LAYOUT: DistrictLayout = {
  district: 'lane',
  buildings: LANE_BUILDINGS,
  cols: LANE_WORLD_COLS,
  worldW: LANE_WORLD_W,
  placements: LANE_PLACEMENTS,
}

export function layoutFor(district: District): DistrictLayout {
  return district === 'main' ? MAIN_LAYOUT : LANE_LAYOUT
}

/**
 * The Memory Lane gate: an archway in the gap between the 2nd and 3rd main
 * street facades (Calkins' and Pavlov's — Ebbinghaus's 1885 slots right into
 * that stretch of the timeline). Walking through requires banking 90 ◆; like
 * every gate in town it is a threshold, not a spend.
 */
export const LANE_UNLOCK_COST = 90
export const GATE_COL = PLACEMENTS[1].col + BUILDING_TILES_W
export const GATE_W_TILES = BUILDING_GAP
/** World-space x of the gate's interaction point (center of the gap). */
export const GATE_DOOR_X = (GATE_COL + GATE_W_TILES / 2) * TILE
export const GATE_DOOR_ROW = STREET_ROW

/** Where the lane's exit (back to Main Street) sits: the west margin. */
export const LANE_EXIT_DOOR_X = TILE * 1.5
export const LANE_EXIT_DOOR_ROW = STREET_ROW

/** Spawn points for district transitions. */
export function spawnXFor(district: District, cameFrom: District | null): number {
  if (district === 'lane') return TILE * 3 // just inside the lane's entrance
  if (cameFrom === 'lane') return GATE_DOOR_X - TILE / 2 // back at the gate
  return TILE * 1.5 // fresh game: west end of Main Street
}

/**
 * Walkable region in tile coordinates: the player may roam the street band and
 * the grass strip below it, but not walk up into the building facades.
 */
export const WALK_TOP_ROW = STREET_ROW
export const WALK_BOTTOM_ROW = WORLD_ROWS - 1

/** Player movement speed in pixels (pre-scale) per second. */
export const PLAYER_SPEED = 60

/** Player collision box size in pre-scale pixels. */
export const PLAYER_W = 10
export const PLAYER_H = 12

/** Distance (in pre-scale px) within which the door prompt appears. Generous
 *  enough that walking the street in front of a facade registers the prompt. */
export const INTERACT_RADIUS = TILE * 3.2
