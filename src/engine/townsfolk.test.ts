import { describe, expect, it } from 'vitest'
import { spawnTownsfolk, stepTownsfolk, LINGER_RADIUS } from './townsfolk'

describe('townsfolk lingering (v1.3)', () => {
  it('wanderers keep walking when the player is far away', () => {
    const folk = spawnTownsfolk()
    const stepped = stepTownsfolk(folk, 0.1, { x: -9999, y: -9999 })
    expect(stepped[0].x).not.toBe(folk[0].x)
  })

  it('a wanderer stands still and faces the player in talk range', () => {
    const folk = spawnTownsfolk()
    const target = folk[0]
    const player = { x: target.x + LINGER_RADIUS / 2, y: target.y }
    const stepped = stepTownsfolk(folk, 0.1, player)
    expect(stepped[0].x).toBe(target.x)
    expect(stepped[0].facing).toBe('right') // player is to the wanderer's east
    // the others, out of range, keep moving
    expect(stepped[1].x).not.toBe(folk[1].x)
  })

  it('does not mutate the input array or its members', () => {
    const folk = spawnTownsfolk()
    const frozen = JSON.stringify(folk)
    stepTownsfolk(folk, 0.25, { x: folk[0].x, y: folk[0].y })
    expect(JSON.stringify(folk)).toBe(frozen)
  })
})
