import { describe, expect, it } from 'vitest'
import { TILE, INTERACT_RADIUS, PLACEMENTS, PLAYER_W, PLAYER_H } from './world'
import { nearestBuildingId, nearestInteractable, TALK_RADIUS } from './proximity'
import { spawnPlayer, type PlayerState } from './player'
import type { WandererState } from './townsfolk'

function playerAt(cx: number, cy: number): PlayerState {
  return { ...spawnPlayer(), x: cx - PLAYER_W / 2, y: cy - PLAYER_H / 2 }
}

function wandererAt(id: string, x: number, y: number): WandererState {
  return {
    id,
    name: id,
    color: '#fff',
    x,
    y,
    vx: 0,
    facing: 'left',
    animTime: 0,
    turnIn: 1,
  }
}

const firstDoor = {
  x: PLACEMENTS[0].doorCol * TILE + TILE / 2,
  y: PLACEMENTS[0].doorRow * TILE,
}

describe('nearestInteractable', () => {
  it('returns the building when standing at its door with no folk around', () => {
    const near = nearestInteractable(playerAt(firstDoor.x, firstDoor.y), [])
    expect(near).toEqual({ kind: 'building', id: PLACEMENTS[0].id })
  })

  it('returns a townsperson standing right next to the player', () => {
    // far from any door (mid-gap, bottom grass) so only the wanderer is in range
    const px = (PLACEMENTS[0].col + 8) * TILE
    const py = firstDoor.y + TILE * 4
    const folk = [wandererAt('mary-ainsworth', px + 6, py)]
    const near = nearestInteractable(playerAt(px, py), folk)
    expect(near).toEqual({ kind: 'townsperson', id: 'mary-ainsworth' })
  })

  it('prefers whichever is closer when both are in range', () => {
    // a step south of the door (dist 16 to the door), wanderer at arm's length
    const px = firstDoor.x
    const py = firstDoor.y + TILE
    const folk = [wandererAt('leon-festinger', px + 4, py)]
    const near = nearestInteractable(playerAt(px, py), folk)
    expect(near).toEqual({ kind: 'townsperson', id: 'leon-festinger' })

    // standing exactly on the door point → the door is strictly closer
    const doorFolk = [wandererAt('leon-festinger', firstDoor.x + 8, firstDoor.y)]
    const near2 = nearestInteractable(
      playerAt(firstDoor.x, firstDoor.y),
      doorFolk,
    )
    expect(near2).toEqual({ kind: 'building', id: PLACEMENTS[0].id })
  })

  it('returns null when nothing is in range', () => {
    const px = (PLACEMENTS[0].col + 8) * TILE
    const py = firstDoor.y + TILE * 4
    const folk = [wandererAt('anna-freud', px + TALK_RADIUS + 20, py)]
    expect(nearestInteractable(playerAt(px, py), folk)).toBeNull()
  })

  it('keeps nearestBuildingId behavior intact (regression)', () => {
    expect(nearestBuildingId(playerAt(firstDoor.x, firstDoor.y))).toBe(
      PLACEMENTS[0].id,
    )
    expect(
      nearestBuildingId(
        playerAt(firstDoor.x, firstDoor.y + INTERACT_RADIUS + TILE * 2),
      ),
    ).toBeNull()
  })
})
