import { TILE, WALK_TOP_ROW, WALK_BOTTOM_ROW, WORLD_W } from './world'
import { TOWNSFOLK } from '../data/buildings'
import type { Facing } from '../art/drawSprites'

export interface WandererState {
  id: string
  name: string
  color: string
  x: number
  y: number
  vx: number
  facing: Facing
  animTime: number
  /** Time until the next direction change. */
  turnIn: number
}

const MIN_Y = (WALK_TOP_ROW + 1) * TILE
const MAX_Y = (WALK_BOTTOM_ROW - 1) * TILE
const SPEED = 22

/** Within this range a wanderer stops strolling and turns to face the player. */
export const LINGER_RADIUS = TILE * 2.5

/** Spread the five townsfolk along the street at start. */
export function spawnTownsfolk(): WandererState[] {
  return TOWNSFOLK.map((t, i) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    x: TILE * (14 + i * 16),
    y: MIN_Y + ((i * 11) % (MAX_Y - MIN_Y)),
    vx: i % 2 === 0 ? SPEED : -SPEED,
    facing: i % 2 === 0 ? 'right' : 'left',
    animTime: 0,
    turnIn: 2 + i * 0.6,
  }))
}

/**
 * Simple bouncing wander; returns new array (immutable update). When the
 * player is close, a wanderer politely stops and faces them — you can't teach
 * attachment theory to someone chasing you down the street.
 */
export function stepTownsfolk(
  prev: WandererState[],
  dt: number,
  player?: { x: number; y: number },
): WandererState[] {
  return prev.map((w) => {
    if (player && Math.hypot(player.x - w.x, player.y - w.y) < LINGER_RADIUS) {
      return {
        ...w,
        facing: player.x >= w.x ? 'right' : 'left',
        animTime: w.animTime, // idle: hold the walk cycle still
      }
    }
    let { x, vx, turnIn } = w
    turnIn -= dt
    if (turnIn <= 0) {
      vx = -vx
      turnIn = 2 + Math.random() * 3
    }
    x += vx * dt
    if (x < TILE) {
      x = TILE
      vx = Math.abs(vx)
    } else if (x > WORLD_W - TILE) {
      x = WORLD_W - TILE
      vx = -Math.abs(vx)
    }
    return {
      ...w,
      x,
      vx,
      turnIn,
      facing: vx >= 0 ? 'right' : 'left',
      animTime: w.animTime + dt,
    }
  })
}

export function wandererStep(w: WandererState): number {
  const phase = Math.floor(w.animTime * 5) % 2
  return phase === 0 ? 1 : 2
}
