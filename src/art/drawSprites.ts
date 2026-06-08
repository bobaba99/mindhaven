import { PLAYER_W } from '../engine/world'

type Ctx = CanvasRenderingContext2D
export type Facing = 'down' | 'up' | 'left' | 'right'

function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

interface SpriteOpts {
  shirt: string
  hair: string
  skin?: string
  facing: Facing
  /** Walk-cycle frame: 0 idle, 1/2 alternating steps. */
  step: number
}

/**
 * Draw a small 12x16-ish humanoid centered horizontally on (x,y) where y is the
 * sprite's feet line. Pure procedural pixel art — no external assets.
 */
function drawHumanoid(ctx: Ctx, x: number, y: number, opts: SpriteOpts) {
  const skin = opts.skin ?? '#f0c89a'
  const w = 12
  const left = x - w / 2
  const topY = y - 18

  // soft shadow at the feet
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(x, y, 6, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // legs (animated)
  const legSwing = opts.step === 1 ? 1 : opts.step === 2 ? -1 : 0
  px(ctx, left + 3 + legSwing, topY + 13, 2, 5, '#3a2a4a')
  px(ctx, left + 7 - legSwing, topY + 13, 2, 5, '#3a2a4a')

  // torso / shirt
  px(ctx, left + 2, topY + 7, 8, 7, opts.shirt)
  px(ctx, left + 2, topY + 7, 8, 1, '#ffffff33')

  // arms
  px(ctx, left + 1, topY + 8, 2, 4, opts.shirt)
  px(ctx, left + 9, topY + 8, 2, 4, opts.shirt)

  // head
  px(ctx, left + 3, topY + 1, 6, 6, skin)

  // hair + face by facing
  switch (opts.facing) {
    case 'down':
      px(ctx, left + 3, topY, 6, 3, opts.hair)
      px(ctx, left + 3, topY + 1, 1, 2, opts.hair)
      px(ctx, left + 8, topY + 1, 1, 2, opts.hair)
      px(ctx, left + 4, topY + 4, 1, 1, '#2a1c10') // eyes
      px(ctx, left + 7, topY + 4, 1, 1, '#2a1c10')
      break
    case 'up':
      px(ctx, left + 3, topY, 6, 5, opts.hair)
      break
    case 'left':
      px(ctx, left + 3, topY, 6, 3, opts.hair)
      px(ctx, left + 3, topY + 1, 2, 4, opts.hair)
      px(ctx, left + 4, topY + 4, 1, 1, '#2a1c10')
      break
    case 'right':
      px(ctx, left + 3, topY, 6, 3, opts.hair)
      px(ctx, left + 7, topY + 1, 2, 4, opts.hair)
      px(ctx, left + 7, topY + 4, 1, 1, '#2a1c10')
      break
  }
}

/** The controllable player (cozy explorer with a satchel). */
export function drawPlayer(ctx: Ctx, x: number, y: number, facing: Facing, step: number) {
  drawHumanoid(ctx, x + PLAYER_W / 2, y + 16, {
    shirt: '#c14a3a',
    hair: '#5a3a22',
    facing,
    step,
  })
  // little satchel strap
  px(ctx, x + 2, y + 6, 8, 1, '#7a5a30')
}

/** A wandering townsperson sprite tinted by their color. */
export function drawTownsperson(
  ctx: Ctx,
  x: number,
  y: number,
  color: string,
  facing: Facing,
  step: number,
) {
  drawHumanoid(ctx, x, y, {
    shirt: color,
    hair: '#3a2a1a',
    facing,
    step,
  })
}
