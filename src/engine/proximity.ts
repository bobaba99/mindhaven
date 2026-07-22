import { TILE, INTERACT_RADIUS, PLACEMENTS } from './world'
import { playerCenter, type PlayerState } from './player'
import type { WandererState } from './townsfolk'

/** Something the player can press E on: a shop door or a wandering townsperson. */
export interface Interactable {
  kind: 'building' | 'townsperson'
  id: string
}

/** Wanderers chat at a tighter radius than doors — they're right beside you. */
export const TALK_RADIUS = TILE * 2.2

/**
 * Return the id of the building whose door the player is standing closest to,
 * within INTERACT_RADIUS — or null if none is in range.
 */
export function nearestBuildingId(player: PlayerState): string | null {
  const { cx, cy } = playerCenter(player)
  let bestId: string | null = null
  let bestDist = INTERACT_RADIUS

  for (const place of PLACEMENTS) {
    const doorX = place.doorCol * TILE + TILE / 2
    const doorY = place.doorRow * TILE // street row just below facade
    const dx = cx - doorX
    const dy = cy - doorY
    const dist = Math.hypot(dx, dy)
    if (dist < bestDist) {
      bestDist = dist
      bestId = place.id
    }
  }
  return bestId
}

/**
 * The closest interactable of any kind — door or townsperson — or null.
 * When both are in range the strictly nearer one wins, so a wanderer
 * strolling past a doorway doesn't hijack the door prompt from afar.
 */
export function nearestInteractable(
  player: PlayerState,
  folk: readonly WandererState[],
): Interactable | null {
  const { cx, cy } = playerCenter(player)

  let best: Interactable | null = null
  let bestDist = INTERACT_RADIUS
  const buildingId = nearestBuildingId(player)
  if (buildingId) {
    const place = PLACEMENTS.find((p) => p.id === buildingId)!
    const doorX = place.doorCol * TILE + TILE / 2
    const doorY = place.doorRow * TILE
    bestDist = Math.hypot(cx - doorX, cy - doorY)
    best = { kind: 'building', id: buildingId }
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
