import { COLORS } from './palette'
import { TILE } from '../engine/world'
import type { Building } from '../data/types'
import type { BuildingPlacement } from '../engine/world'

type Ctx = CanvasRenderingContext2D

function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

/** Distinct silhouette/detail variants keyed off the building order. */
type Variant =
  | 'townhall' // clock tower
  | 'library'
  | 'store' // striped awning
  | 'saloon'
  | 'ranch'
  | 'clinic' // cross
  | 'curiosity' // pointed roof + crescent
  | 'bakery' // chimney + pie sign
  | 'inn'
  | 'school' // bell cupola
  | 'gym'
  | 'diner' // two awnings
  | 'studio' // camera/aperture
  | 'theater' // stage curtains

const VARIANT_BY_ID: Record<string, Variant> = {
  'leipzig-lab': 'townhall',
  'calkins-reading-room': 'library',
  'pavlov-provisions': 'store',
  'skinner-arcade': 'saloon',
  'watson-nursery': 'ranch',
  'freud-couch': 'clinic',
  'jung-emporium': 'curiosity',
  'maslow-bakery': 'bakery',
  'rogers-inn': 'inn',
  'piaget-schoolhouse': 'school',
  'bandura-gym': 'gym',
  'kahneman-diner': 'diner',
  'loftus-studio': 'studio',
  'asch-milgram-stage': 'theater',
}

/**
 * Draw one building facade. `locked` dims the whole thing and adds a padlock.
 */
export function drawBuilding(
  ctx: Ctx,
  building: Building,
  place: BuildingPlacement,
  locked: boolean,
) {
  const p = building.palette
  const x = place.col * TILE
  const y = place.row * TILE
  const w = place.widthTiles * TILE
  const bodyTop = y + TILE * 1.6 // leave room for the roof
  const bodyH = place.heightTiles * TILE - TILE * 1.6
  const variant = VARIANT_BY_ID[building.id] ?? 'store'

  // ground shadow
  ctx.fillStyle = COLORS.shadow
  ctx.fillRect(x + 2, y + place.heightTiles * TILE - 2, w - 4, 4)

  // --- wall ---
  px(ctx, x, bodyTop, w, bodyH, p.wall)
  // plank shading on the right third
  px(ctx, x + w - w / 3, bodyTop, w / 3, bodyH, p.wallDark)
  // horizontal plank lines
  for (let ly = bodyTop + 6; ly < bodyTop + bodyH; ly += 7) {
    px(ctx, x, ly, w, 1, p.wallDark)
  }

  // --- roof ---
  drawRoof(ctx, x, y, w, p)

  // --- door (centered, two tiles tall) ---
  const doorW = TILE - 2
  const doorH = TILE * 1.8
  const doorX = x + w / 2 - doorW / 2
  const doorY = bodyTop + bodyH - doorH
  px(ctx, doorX, doorY, doorW, doorH, p.door)
  px(ctx, doorX, doorY, 2, doorH, '#00000033')
  px(ctx, doorX + doorW - 3, doorY + doorH / 2 - 1, 2, 3, COLORS.doorKnob)
  // door frame
  ctx.strokeStyle = p.roofDark
  ctx.lineWidth = 2
  ctx.strokeRect(doorX - 1, doorY - 1, doorW + 2, doorH + 1)

  // --- windows flanking the door ---
  const winY = bodyTop + 8
  drawWindow(ctx, x + 6, winY, p)
  drawWindow(ctx, x + w - 6 - 10, winY, p)

  // --- variant detail ---
  drawVariant(ctx, variant, x, y, w, bodyTop, p)

  // --- hanging sign with the figure name ---
  drawSign(ctx, building, x, bodyTop, w)

  if (locked) {
    drawLockOverlay(ctx, x, y, w, place.heightTiles * TILE, building.unlockCost)
  }
}

function drawRoof(ctx: Ctx, x: number, y: number, w: number, p: Building['palette']) {
  // trapezoid roof
  ctx.fillStyle = p.roof
  ctx.beginPath()
  ctx.moveTo(x - 3, y + TILE * 1.6)
  ctx.lineTo(x + w * 0.18, y + 2)
  ctx.lineTo(x + w * 0.82, y + 2)
  ctx.lineTo(x + w + 3, y + TILE * 1.6)
  ctx.closePath()
  ctx.fill()
  // shingle rows
  ctx.fillStyle = p.roofDark
  for (let i = 0; i < 3; i++) {
    const ry = y + 4 + i * 6
    ctx.fillRect(x + 2 + i * 2, ry, w - 4 - i * 4, 1)
  }
  // eave shadow
  px(ctx, x - 3, y + TILE * 1.6 - 2, w + 6, 2, p.roofDark)
}

function drawWindow(ctx: Ctx, x: number, y: number, p: Building['palette']) {
  const w = 10
  const h = 9
  px(ctx, x, y, w, h, p.roofDark)
  px(ctx, x + 1, y + 1, w - 2, h - 2, COLORS.windowGlass)
  px(ctx, x + 1, y + 1 + (h - 2) / 2, w - 2, 1, COLORS.windowGlassDark)
  px(ctx, x + (w - 2) / 2, y + 1, 1, h - 2, COLORS.windowGlassDark)
}

function drawSign(ctx: Ctx, building: Building, x: number, bodyTop: number, w: number) {
  const sw = w - 10
  const sx = x + 5
  const sy = bodyTop - 2
  const sh = 11
  px(ctx, sx, sy, sw, sh, '#3a2a1a')
  px(ctx, sx + 1, sy + 1, sw - 2, sh - 2, building.palette.accent)
  ctx.fillStyle = '#2a1c10'
  ctx.font = '7px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = building.figure.split('&')[0].trim()
  ctx.fillText(label, sx + sw / 2, sy + sh / 2 + 1, sw - 4)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawVariant(
  ctx: Ctx,
  variant: Variant,
  x: number,
  y: number,
  w: number,
  bodyTop: number,
  p: Building['palette'],
) {
  const cx = x + w / 2
  switch (variant) {
    case 'townhall': {
      // clock tower
      px(ctx, cx - 6, y - 14, 12, 16, p.wallDark)
      px(ctx, cx - 7, y - 18, 14, 5, p.roof)
      // clock face
      ctx.fillStyle = '#f4ecd8'
      ctx.beginPath()
      ctx.arc(cx, y - 6, 4, 0, Math.PI * 2)
      ctx.fill()
      px(ctx, cx, y - 9, 1, 3, '#2a1c10')
      px(ctx, cx, y - 6, 2, 1, '#2a1c10')
      break
    }
    case 'library':
      // book emblem above door
      px(ctx, cx - 5, bodyTop + 2, 10, 7, '#f4ecd8')
      px(ctx, cx - 1, bodyTop + 2, 2, 7, p.roofDark)
      break
    case 'store': {
      // striped awning over the door
      const aw = w - 12
      for (let i = 0; i < aw; i += 6) {
        const stripe = (i / 6) % 2 === 0 ? '#d84a3a' : '#f4ecd8'
        px(ctx, x + 6 + i, bodyTop + 1, 6, 6, stripe)
      }
      px(ctx, x + 6, bodyTop + 7, aw, 2, p.roofDark)
      break
    }
    case 'saloon':
      // swinging double-door hint + barrel
      px(ctx, cx - 1, bodyTop + 14, 2, 18, '#2a1c10')
      px(ctx, x + 8, bodyTop + 22, 6, 8, '#7a4a26')
      px(ctx, x + 8, bodyTop + 24, 6, 1, '#3a2410')
      break
    case 'ranch':
      // little fence + hay bale
      for (let i = 0; i < 3; i++) px(ctx, x + 6 + i * 4, bodyTop + 24, 2, 8, COLORS.fence)
      px(ctx, x + w - 16, bodyTop + 24, 9, 7, '#cdb35a')
      break
    case 'clinic':
      // medical cross
      px(ctx, cx - 2, bodyTop + 2, 4, 10, '#d83a3a')
      px(ctx, cx - 5, bodyTop + 5, 10, 4, '#d83a3a')
      break
    case 'curiosity': {
      // pointed witch-hat roof + crescent moon
      ctx.fillStyle = p.roofDark
      ctx.beginPath()
      ctx.moveTo(cx - 8, y + 2)
      ctx.lineTo(cx, y - 14)
      ctx.lineTo(cx + 8, y + 2)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = COLORS.lampGlow
      ctx.beginPath()
      ctx.arc(cx, y - 5, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = p.roofDark
      ctx.beginPath()
      ctx.arc(cx + 1.5, y - 6, 3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'bakery':
      // chimney with smoke + pie sign
      px(ctx, x + w - 14, y - 10, 6, 12, p.roofDark)
      ctx.fillStyle = '#e8e0d0'
      ctx.beginPath()
      ctx.arc(x + w - 11, y - 13, 2.5, 0, Math.PI * 2)
      ctx.arc(x + w - 9, y - 17, 3, 0, Math.PI * 2)
      ctx.fill()
      px(ctx, cx - 5, bodyTop + 2, 10, 6, '#e8c27a')
      px(ctx, cx - 5, bodyTop + 2, 10, 2, '#c98f4a')
      break
    case 'inn':
      // welcome lantern
      px(ctx, cx - 2, bodyTop + 1, 4, 6, COLORS.lampPost)
      px(ctx, cx - 1, bodyTop + 2, 2, 4, COLORS.lampGlow)
      break
    case 'school': {
      // bell cupola
      px(ctx, cx - 5, y - 12, 10, 12, '#f4ecd8')
      ctx.fillStyle = p.roof
      ctx.beginPath()
      ctx.moveTo(cx - 6, y - 12)
      ctx.lineTo(cx, y - 18)
      ctx.lineTo(cx + 6, y - 12)
      ctx.closePath()
      ctx.fill()
      px(ctx, cx - 2, y - 9, 4, 5, '#caa23a') // bell
      break
    }
    case 'gym':
      // dumbbell over door
      px(ctx, cx - 7, bodyTop + 3, 14, 3, '#4a4a52')
      px(ctx, cx - 8, bodyTop + 1, 3, 7, '#3a3a42')
      px(ctx, cx + 5, bodyTop + 1, 3, 7, '#3a3a42')
      break
    case 'diner': {
      // two small awnings (fast / slow)
      for (let i = 0; i < 8; i++) px(ctx, x + 5 + i * 3, bodyTop + 1, 3, 5, i % 2 ? '#d84a3a' : '#f4ecd8')
      for (let i = 0; i < 8; i++) px(ctx, x + w - 29 + i * 3, bodyTop + 1, 3, 5, i % 2 ? '#3a7ad8' : '#f4ecd8')
      break
    }
    case 'studio': {
      // camera aperture emblem
      ctx.strokeStyle = '#2a1c10'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, bodyTop + 6, 5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#2a1c10'
      ctx.beginPath()
      ctx.arc(cx, bodyTop + 6, 2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'theater': {
      // stage curtains framing the door
      ctx.fillStyle = '#a83040'
      ctx.beginPath()
      ctx.moveTo(x + 4, bodyTop)
      ctx.lineTo(x + 14, bodyTop)
      ctx.lineTo(x + 8, bodyTop + 22)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(x + w - 4, bodyTop)
      ctx.lineTo(x + w - 14, bodyTop)
      ctx.lineTo(x + w - 8, bodyTop + 22)
      ctx.closePath()
      ctx.fill()
      break
    }
  }
}

function drawLockOverlay(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  cost: number,
) {
  ctx.fillStyle = 'rgba(20,16,12,0.55)'
  ctx.fillRect(x - 3, y - 18, w + 6, h + 20)
  const cx = x + w / 2
  const cy = y + h / 2
  // padlock body
  px(ctx, cx - 6, cy, 12, 10, '#e0c04b')
  px(ctx, cx - 6, cy, 12, 2, '#b8962f')
  // shackle
  ctx.strokeStyle = '#cdcdcd'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 4, Math.PI, 0)
  ctx.stroke()
  // keyhole
  px(ctx, cx - 1, cy + 3, 2, 4, '#5a4420')
  // cost label
  ctx.fillStyle = '#ffe6a0'
  ctx.font = '7px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${cost} ◆`, cx, cy + 18)
  ctx.textAlign = 'left'
}
