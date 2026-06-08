import { BUILDINGS } from '../data/buildings'

/**
 * World layout for Wundt Way. The town is a horizontal Main Street: a wide
 * grid where 14 building facades sit in a row along the north side, a walkable
 * path runs along the south, and grass frames it. All units are TILES; the
 * renderer multiplies by TILE * SCALE for pixels.
 */

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

/** Compute deterministic left->right placements for every building. */
export function computePlacements(): BuildingPlacement[] {
  return BUILDINGS.map((b, i) => {
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

export const PLACEMENTS = computePlacements()

/** Pixel dimensions of the whole world (pre-scale). */
export const WORLD_W = WORLD_COLS * TILE
export const WORLD_H = WORLD_ROWS * TILE

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
