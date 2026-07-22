import {
  TILE,
  INTERACT_RADIUS,
  PLACEMENTS,
  GATE_DOOR_X,
  GATE_DOOR_ROW,
  LANE_EXIT_DOOR_X,
  LANE_EXIT_DOOR_ROW,
  layoutFor,
  type District,
  type BuildingPlacement,
} from './world'
import { playerCenter, type PlayerState } from './player'
import type { WandererState } from './townsfolk'

/** Something the player can press E on: a door, a townsperson, or a gate. */
export interface Interactable {
  kind: 'building' | 'townsperson' | 'gate'
  id: string
}

/** The gate ids double as destination names. */
export const GATE_TO_LANE = 'memory-lane'
export const GATE_TO_MAIN = 'wundt-way'

/** Wanderers chat at a tighter radius than doors — they're right beside you. */
export const TALK_RADIUS = TILE * 2.2

/** Gates read like doors: same generous radius. */
const GATE_RADIUS = INTERACT_RADIUS

function nearestPlacementId(
  cx: number,
  cy: number,
  placements: readonly BuildingPlacement[],
): { id: string; dist: number } | null {
  let bestId: string | null = null
  let bestDist = INTERACT_RADIUS
  for (const place of placements) {
    const doorX = place.doorCol * TILE + TILE / 2
    const doorY = place.doorRow * TILE // street row just below facade
    const dist = Math.hypot(cx - doorX, cy - doorY)
    if (dist < bestDist) {
      bestDist = dist
      bestId = place.id
    }
  }
  return bestId === null ? null : { id: bestId, dist: bestDist }
}

/**
 * Return the id of the building whose door the player is standing closest to,
 * within INTERACT_RADIUS — or null if none is in range.
 */
export function nearestBuildingId(
  player: PlayerState,
  placements: readonly BuildingPlacement[] = PLACEMENTS,
): string | null {
  const { cx, cy } = playerCenter(player)
  return nearestPlacementId(cx, cy, placements)?.id ?? null
}

/**
 * The closest interactable of any kind — door, townsperson, or district gate
 * — or null. When several are in range the strictly nearer one wins, so a
 * wanderer strolling past a doorway doesn't hijack the door prompt from afar.
 */
export function nearestInteractable(
  player: PlayerState,
  folk: readonly WandererState[],
  district: District = 'main',
): Interactable | null {
  const { cx, cy } = playerCenter(player)
  const layout = layoutFor(district)

  let best: Interactable | null = null
  let bestDist = INTERACT_RADIUS

  const building = nearestPlacementId(cx, cy, layout.placements)
  if (building) {
    best = { kind: 'building', id: building.id }
    bestDist = building.dist
  }

  const gate =
    district === 'main'
      ? { x: GATE_DOOR_X, y: GATE_DOOR_ROW * TILE, id: GATE_TO_LANE }
      : { x: LANE_EXIT_DOOR_X, y: LANE_EXIT_DOOR_ROW * TILE, id: GATE_TO_MAIN }
  const gateDist = Math.hypot(cx - gate.x, cy - gate.y)
  if (gateDist < GATE_RADIUS && gateDist < bestDist) {
    best = { kind: 'gate', id: gate.id }
    bestDist = gateDist
  }

  for (const w of folk) {
    const dist = Math.hypot(cx - w.x, cy - w.y)
    if (dist < TALK_RADIUS && dist < bestDist) {
      bestDist = dist
      best = { kind: 'townsperson', id: w.id }
    }
  }
  return best
}
