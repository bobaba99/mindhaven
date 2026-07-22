import { ALL_BUILDINGS } from '../data/buildings'
import {
  SCALE,
  TILE,
  GATE_DOOR_X,
  BUILDING_TOP_ROW,
  BUILDING_TILES_H,
  LANE_UNLOCK_COST,
  layoutFor,
  type District,
} from './world'

/**
 * Crisp text pass for building signs and lock costs. The pixel-art world is
 * rasterized at 1x and nearest-neighbor upscaled — charming for art, mud for
 * letters. This overlay redraws JUST the text at full device resolution every
 * frame, in CSS-pixel space, so names stay sharp at any zoom/DPR.
 */

interface SignSpot {
  id: string
  label: string
  /** World-space (pre-scale) center of the sign board. */
  x: number
  y: number
  /** World-space max text width. */
  maxW: number
  /** World-space center for the locked-cost label. */
  costX: number
  costY: number
  cost: number
}

const BUILDING_BY_ID = new Map(ALL_BUILDINGS.map((b) => [b.id, b]))

/** Same geometry as drawBuilding/drawSign — kept in lockstep. */
function computeSignSpots(district: District): SignSpot[] {
  return layoutFor(district).placements.map((place) => {
    const building = BUILDING_BY_ID.get(place.id)!
    const x = place.col * TILE
    const w = place.widthTiles * TILE
    const bodyTop = place.row * TILE + TILE * 1.6
    const sw = w - 10
    return {
      id: place.id,
      label: building.figure.split('&')[0].trim(),
      x: x + 5 + sw / 2,
      // sy + sh/2 + 1 — identical vertical center to the old in-canvas drawSign
      y: bodyTop - 2 + 6.5,
      maxW: sw - 4,
      costX: x + w / 2,
      costY: place.row * TILE + (place.heightTiles * TILE) / 2 + 18,
      cost: building.unlockCost,
    }
  })
}

const SIGN_SPOTS_BY_DISTRICT: Record<District, SignSpot[]> = {
  main: computeSignSpots('main'),
  lane: computeSignSpots('lane'),
}

/** Kept for existing imports/tests: the main-street spots. */
export const SIGN_SPOTS = SIGN_SPOTS_BY_DISTRICT.main

const SIGN_FONT = `700 ${Math.round(5.4 * SCALE)}px "Courier New", monospace`
const COST_FONT = `700 ${Math.round(6 * SCALE)}px "Courier New", monospace`

/** The gate's crisp label + (locked) threshold plate, main street only. */
const GATE_LABEL_Y = (BUILDING_TOP_ROW + 1) * TILE - 12
const GATE_COST_Y = (BUILDING_TOP_ROW + BUILDING_TILES_H / 2) * TILE + 10

function drawCostPlate(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  text: string,
) {
  ctx.font = COST_FONT
  const metrics = ctx.measureText(text)
  const padX = 6
  const h = 7 * SCALE
  ctx.fillStyle = 'rgba(20,16,12,0.7)'
  ctx.fillRect(cx - metrics.width / 2 - padX, cy - h / 2, metrics.width + padX * 2, h)
  ctx.fillStyle = '#ffe6a0'
  ctx.fillText(text, cx, cy)
}

/**
 * Draw the overlay. `ctx` must be reset (identity transform); we scale to
 * CSS pixels via dpr and place text against the camera.
 */
export function drawSignOverlay(
  ctx: CanvasRenderingContext2D,
  opts: {
    camX: number
    dpr: number
    /** Viewport width in CSS pixels. */
    viewCssW: number
    unlockedIds: ReadonlySet<string>
    district?: District
    /** Whether the Memory Lane gate threshold has been reached. */
    gateOpen?: boolean
  },
): void {
  const { camX, dpr, viewCssW, unlockedIds, district = 'main', gateOpen = false } = opts
  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const spot of SIGN_SPOTS_BY_DISTRICT[district]) {
    const cx = (spot.x - camX) * SCALE
    if (cx < -150 || cx > viewCssW + 150) continue
    ctx.font = SIGN_FONT
    ctx.fillStyle = '#2a1c10'
    ctx.fillText(spot.label, cx, spot.y * SCALE, spot.maxW * SCALE)

    if (!unlockedIds.has(spot.id)) {
      const costCx = (spot.costX - camX) * SCALE
      drawCostPlate(ctx, costCx, spot.costY * SCALE, `${spot.cost} ◆`)
    }
  }

  if (district === 'main') {
    const gateCx = (GATE_DOOR_X - camX) * SCALE
    if (gateCx > -150 && gateCx < viewCssW + 150) {
      ctx.font = SIGN_FONT
      ctx.fillStyle = '#1e3018'
      ctx.fillText('Memory Lane', gateCx, GATE_LABEL_Y * SCALE, GATE_W_PX * SCALE)
      if (!gateOpen) {
        drawCostPlate(ctx, gateCx, GATE_COST_Y * SCALE, `${LANE_UNLOCK_COST} ◆`)
      }
    }
  }

  ctx.restore()
}

/** Max text width for the gate label (the 2-tile gap plus a little spill). */
const GATE_W_PX = TILE * 3.4
