import {
  PLACEMENTS,
  STREET_ROW,
  EDGE_MARGIN_TILES,
  WORLD_COLS,
  WORLD_W,
  WORLD_H,
} from './world'
import { BUILDINGS } from '../data/buildings'
import { drawBackdrop, drawTree, drawLamp, drawFence } from '../art/drawTiles'
import { drawBuilding } from '../art/drawBuilding'

const BUILDING_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b]))

/**
 * Render the entire static world (backdrop + props + building facades) into an
 * offscreen canvas at 1x internal resolution. Re-run only when unlock state
 * changes (locked buildings render dimmed). Returns the offscreen canvas.
 */
export function renderStaticWorld(unlockedIds: Set<string>): HTMLCanvasElement {
  const cvs = document.createElement('canvas')
  cvs.width = WORLD_W
  cvs.height = WORLD_H
  const ctx = cvs.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  drawBackdrop(ctx)
  drawDecor(ctx)

  for (const place of PLACEMENTS) {
    const building = BUILDING_BY_ID.get(place.id)
    if (!building) continue
    drawBuilding(ctx, building, place, !unlockedIds.has(place.id))
  }

  return cvs
}

/** Scatter trees, lamps and fences for cozy detail along the grass + path. */
function drawDecor(ctx: CanvasRenderingContext2D) {
  // border trees on the far left / right grass margins
  drawTree(ctx, 0, STREET_ROW + 2)
  drawTree(ctx, 1, STREET_ROW + 4)
  drawTree(ctx, WORLD_COLS - 2, STREET_ROW + 2)
  drawTree(ctx, WORLD_COLS - 1, STREET_ROW + 4)

  // lamp posts between every other building, on the street's lower edge
  for (let i = 0; i < PLACEMENTS.length; i++) {
    const place = PLACEMENTS[i]
    if (i % 2 === 0) {
      drawLamp(ctx, place.col - 1, STREET_ROW + 3)
    }
    // a small fence + bush nub in the gap after each building
    drawFence(ctx, place.col + place.widthTiles, STREET_ROW + 4)
  }

  // a few decorative bushes/trees on the bottom grass strip
  const bottomRow = STREET_ROW + 5
  for (let c = EDGE_MARGIN_TILES; c < WORLD_COLS - 2; c += 9) {
    drawTree(ctx, c, bottomRow)
  }
}
