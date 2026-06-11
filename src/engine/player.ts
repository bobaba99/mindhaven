import {
  TILE,
  PLAYER_SPEED,
  PLAYER_W,
  PLAYER_H,
  WALK_TOP_ROW,
  WALK_BOTTOM_ROW,
  WORLD_W,
} from './world'
import type { InputState } from './input'
import type { Facing } from '../art/drawSprites'

export interface PlayerState {
  x: number // top-left pixel (pre-scale) of the collision box
  y: number
  facing: Facing
  /** Accumulated distance for the walk-cycle. */
  animTime: number
  moving: boolean
}

const WALK_MIN_X = TILE * 0.5
const WALK_MAX_X = WORLD_W - PLAYER_W - TILE * 0.5
const WALK_MIN_Y = WALK_TOP_ROW * TILE
const WALK_MAX_Y = (WALK_BOTTOM_ROW + 1) * TILE - PLAYER_H

/**
 * Where the player first spawns: on the western edge of town, a short stroll
 * WEST of the Leipzig Lab's door radius — so the first thing a new player does
 * is walk (which is exactly what the first-run tour teaches), and the whole
 * west→east timeline lies ahead of them.
 */
export function spawnPlayer(): PlayerState {
  return {
    x: TILE * 1.5,
    y: WALK_MIN_Y + TILE * 1.5,
    facing: 'right',
    animTime: 0,
    moving: false,
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/**
 * Advance the player by one tick. Pure-ish: returns a new state object
 * (immutable update) rather than mutating the input.
 */
export function stepPlayer(
  prev: PlayerState,
  input: InputState,
  dt: number,
): PlayerState {
  let dx = 0
  let dy = 0
  if (input.left) dx -= 1
  if (input.right) dx += 1
  if (input.up) dy -= 1
  if (input.down) dy += 1

  const moving = dx !== 0 || dy !== 0

  let facing = prev.facing
  if (dx < 0) facing = 'left'
  else if (dx > 0) facing = 'right'
  else if (dy < 0) facing = 'up'
  else if (dy > 0) facing = 'down'

  // normalize diagonal speed
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.SQRT2
    dx *= inv
    dy *= inv
  }

  const dist = PLAYER_SPEED * dt
  const nx = clamp(prev.x + dx * dist, WALK_MIN_X, WALK_MAX_X)
  const ny = clamp(prev.y + dy * dist, WALK_MIN_Y, WALK_MAX_Y)

  return {
    x: nx,
    y: ny,
    facing,
    moving,
    animTime: moving ? prev.animTime + dt : 0,
  }
}

/** Convert animTime into a 3-frame walk step (0 idle, 1, 2). */
export function walkStep(p: PlayerState): number {
  if (!p.moving) return 0
  const phase = Math.floor(p.animTime * 6) % 2
  return phase === 0 ? 1 : 2
}

/** Center point of the player's collision box (for proximity checks). */
export function playerCenter(p: PlayerState): { cx: number; cy: number } {
  return { cx: p.x + PLAYER_W / 2, cy: p.y + PLAYER_H / 2 }
}
