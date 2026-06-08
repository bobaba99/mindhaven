import { TILE, INTERACT_RADIUS, PLACEMENTS } from './world'
import { playerCenter, type PlayerState } from './player'

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

export function buildingDoorPixel(id: string): { x: number; y: number } | null {
  const place = PLACEMENTS.find((p) => p.id === id)
  if (!place) return null
  return { x: place.doorCol * TILE + TILE / 2, y: place.doorRow * TILE }
}
