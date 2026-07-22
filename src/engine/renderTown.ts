import {
  STREET_ROW,
  EDGE_MARGIN_TILES,
  WORLD_H,
  GATE_COL,
  GATE_W_TILES,
  layoutFor,
  type District,
  type BuildingPlacement,
} from './world'
import { ALL_BUILDINGS } from '../data/buildings'
import { drawBackdrop, drawTree, drawLamp, drawFence, drawGate } from '../art/drawTiles'
import { drawBuilding } from '../art/drawBuilding'

const BUILDING_BY_ID = new Map(ALL_BUILDINGS.map((b) => [b.id, b]))

/**
 * Render a district's entire static world (backdrop + props + facades) into
 * an offscreen canvas at 1x internal resolution. Re-run only when unlock
 * state, district, or the gate's open state changes.
 */
export function renderStaticWorld(
  unlockedIds: Set<string>,
  district: District = 'main',
  gateOpen: boolean = false,
): HTMLCanvasElement {
  const layout = layoutFor(district)
  const cvs = document.createElement('canvas')
  cvs.width = layout.worldW
  cvs.height = WORLD_H
  const ctx = cvs.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  drawBackdrop(ctx, layout.cols)
  drawDecor(ctx, layout.cols, layout.placements)

  for (const place of layout.placements) {
    const building = BUILDING_BY_ID.get(place.id)
    if (!building) continue
    drawBuilding(ctx, building, place, !unlockedIds.has(place.id))
  }

  // Main Street: the Memory Lane archway between Calkins' and Pavlov's.
  if (district === 'main') {
    drawGate(ctx, GATE_COL, GATE_W_TILES, gateOpen)
  } else {
    // The lane's exit back south to Main Street: an open arch at the west end.
    drawGate(ctx, 0, 2, true)
  }

  return cvs
}

/** Scatter trees, lamps and fences for cozy detail along the grass + path. */
function drawDecor(
  ctx: CanvasRenderingContext2D,
  cols: number,
  placements: readonly BuildingPlacement[],
) {
  // border trees on the far left / right grass margins
  drawTree(ctx, 0, STREET_ROW + 2)
  drawTree(ctx, 1, STREET_ROW + 4)
  drawTree(ctx, cols - 2, STREET_ROW + 2)
  drawTree(ctx, cols - 1, STREET_ROW + 4)

  // lamp posts between every other building, on the street's lower edge
  for (let i = 0; i < placements.length; i++) {
    const place = placements[i]
    if (i % 2 === 0) {
      drawLamp(ctx, place.col - 1, STREET_ROW + 3)
    }
    // a small fence + bush nub in the gap after each building
    drawFence(ctx, place.col + place.widthTiles, STREET_ROW + 4)
  }

  // a few decorative bushes/trees on the bottom grass strip
  const bottomRow = STREET_ROW + 5
  for (let c = EDGE_MARGIN_TILES; c < cols - 2; c += 9) {
    drawTree(ctx, c, bottomRow)
  }
}
