import { describe, expect, it } from 'vitest'
import { playerCenter, spawnPlayer } from './player'
import { nearestBuildingId } from './proximity'
import { INTERACT_RADIUS, PLACEMENTS, TILE } from './world'

describe('player spawn', () => {
  it('spawns outside every door radius, so the tour teaches walking first', () => {
    const spawn = spawnPlayer()
    expect(nearestBuildingId(spawn)).toBeNull()
    const { cx, cy } = playerCenter(spawn)
    for (const place of PLACEMENTS) {
      const doorX = place.doorCol * TILE + TILE / 2
      const doorY = place.doorRow * TILE
      expect(Math.hypot(cx - doorX, cy - doorY)).toBeGreaterThan(INTERACT_RADIUS)
    }
  })

  it('spawns west of the first shop — the stroll into town goes east', () => {
    const spawn = spawnPlayer()
    const firstDoorX = PLACEMENTS[0].doorCol * TILE
    expect(spawn.x).toBeLessThan(firstDoorX)
  })
})
