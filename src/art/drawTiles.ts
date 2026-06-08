import { COLORS } from './palette'
import {
  TILE,
  WORLD_COLS,
  WORLD_ROWS,
  SKY_ROWS,
  BUILDING_TOP_ROW,
  BUILDING_TILES_H,
  STREET_ROW,
  STREET_ROWS,
} from '../engine/world'

type Ctx = CanvasRenderingContext2D

/** Tiny deterministic hash so scattered detail stays put between frames. */
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

/** Sky gradient + a couple of soft clouds, drawn once into the static layer. */
function drawSky(ctx: Ctx) {
  const skyH = SKY_ROWS * TILE + 2 * TILE // extend a touch behind rooftops
  const grad = ctx.createLinearGradient(0, 0, 0, skyH)
  grad.addColorStop(0, COLORS.skyTop)
  grad.addColorStop(1, COLORS.skyLow)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WORLD_COLS * TILE, skyH)

  const clouds: Array<[number, number, number]> = [
    [6, 1, 3],
    [22, 0.6, 4],
    [40, 1.4, 3],
    [58, 0.8, 4],
    [78, 1.1, 3],
  ]
  for (const [cx, cy, w] of clouds) {
    const bx = cx * TILE
    const by = cy * TILE
    for (let i = 0; i < w; i++) {
      const bump = i === 0 || i === w - 1 ? 3 : 0
      px(ctx, bx + i * 6, by + bump, 7, 6 - bump / 2, COLORS.cloud)
    }
  }
}

/** Grass band with scattered blades; covers everything below the sky. */
function drawGrass(ctx: Ctx) {
  const top = SKY_ROWS * TILE
  const h = (WORLD_ROWS - SKY_ROWS) * TILE
  px(ctx, 0, top, WORLD_COLS * TILE, h, COLORS.grass)

  // subtle checker shading
  for (let r = SKY_ROWS; r < WORLD_ROWS; r++) {
    for (let c = 0; c < WORLD_COLS; c++) {
      if ((r + c) % 2 === 0) {
        px(ctx, c * TILE, r * TILE, TILE, TILE, COLORS.grassDark)
      }
    }
  }
  // blades
  for (let r = SKY_ROWS; r < WORLD_ROWS; r++) {
    for (let c = 0; c < WORLD_COLS; c++) {
      const h1 = hash(c, r)
      if (h1 > 0.86) {
        const gx = c * TILE + Math.floor(hash(c + 1, r) * (TILE - 3))
        const gy = r * TILE + Math.floor(hash(c, r + 1) * (TILE - 4))
        px(ctx, gx, gy, 1, 3, COLORS.grassBlade)
        px(ctx, gx + 2, gy + 1, 1, 2, COLORS.grassBlade)
      }
    }
  }
}

/** The walkable cobble path along the street band. */
function drawPath(ctx: Ctx) {
  const top = STREET_ROW * TILE
  const h = STREET_ROWS * TILE
  const w = WORLD_COLS * TILE
  px(ctx, 0, top, w, h, COLORS.path)

  // cobble speckle
  for (let r = STREET_ROW; r < STREET_ROW + STREET_ROWS; r++) {
    for (let c = 0; c < WORLD_COLS; c++) {
      const h1 = hash(c * 3, r * 5)
      if (h1 > 0.7) {
        px(ctx, c * TILE + 2, r * TILE + 3, 4, 3, COLORS.pathDark)
      }
      if (h1 < 0.18) {
        px(ctx, c * TILE + 9, r * TILE + 8, 3, 2, COLORS.pathDark)
      }
    }
  }
  // edges
  px(ctx, 0, top, w, 2, COLORS.pathEdge)
  px(ctx, 0, top + h - 2, w, 2, COLORS.pathEdge)
}

/** A simple tree at tile (col,row) — canopy + trunk. */
export function drawTree(ctx: Ctx, col: number, row: number) {
  const x = col * TILE
  const y = row * TILE
  // shadow
  ctx.fillStyle = COLORS.shadow
  ctx.beginPath()
  ctx.ellipse(x + TILE / 2, y + TILE + 6, TILE * 0.7, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // trunk
  px(ctx, x + TILE / 2 - 2, y + TILE - 2, 4, 8, COLORS.trunk)
  px(ctx, x + TILE / 2 - 2, y + TILE - 2, 2, 8, COLORS.trunkDark)
  // canopy (layered blobs)
  ctx.fillStyle = COLORS.leafDark
  ctx.beginPath()
  ctx.ellipse(x + TILE / 2, y + 2, TILE * 0.78, TILE * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.leaf
  ctx.beginPath()
  ctx.ellipse(x + TILE / 2, y, TILE * 0.62, TILE * 0.58, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.leafHi
  ctx.beginPath()
  ctx.ellipse(x + TILE / 2 - 3, y - 3, TILE * 0.28, TILE * 0.26, 0, 0, Math.PI * 2)
  ctx.fill()
}

/** A lamp post at tile (col,row); base sits on the row's bottom. */
export function drawLamp(ctx: Ctx, col: number, row: number) {
  const x = col * TILE + TILE / 2
  const baseY = row * TILE + TILE
  ctx.fillStyle = COLORS.shadow
  ctx.fillRect(x - 5, baseY, 10, 3)
  px(ctx, x - 1, baseY - 18, 2, 18, COLORS.lampPost)
  // lantern
  px(ctx, x - 4, baseY - 24, 8, 7, COLORS.lampPost)
  px(ctx, x - 3, baseY - 23, 6, 5, COLORS.lampGlow)
}

/** A short picket-fence segment occupying one tile width. */
export function drawFence(ctx: Ctx, col: number, row: number) {
  const x = col * TILE
  const y = row * TILE + 4
  px(ctx, x, y + 4, TILE, 2, COLORS.fenceDark)
  for (let i = 0; i < 3; i++) {
    const px0 = x + 1 + i * 5
    px(ctx, px0, y, 3, TILE - 6, COLORS.fence)
    px(ctx, px0, y, 1, TILE - 6, COLORS.fenceDark)
  }
}

/** Draw the whole static backdrop (sky, grass, path) into a ctx. */
export function drawBackdrop(ctx: Ctx) {
  drawSky(ctx)
  drawGrass(ctx)
  drawPath(ctx)
  // a darker grass lip just under the buildings to ground them
  const lipY = (BUILDING_TOP_ROW + BUILDING_TILES_H) * TILE - 1
  px(ctx, 0, lipY, WORLD_COLS * TILE, 2, COLORS.grassDark)
}
