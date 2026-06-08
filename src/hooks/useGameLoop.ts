import { useEffect, useRef } from 'react'
import { SCALE, WORLD_W, WORLD_H, PLAYER_W } from '../engine/world'
import { createInput } from '../engine/input'
import {
  spawnPlayer,
  stepPlayer,
  walkStep,
  type PlayerState,
} from '../engine/player'
import {
  spawnTownsfolk,
  stepTownsfolk,
  wandererStep,
  type WandererState,
} from '../engine/townsfolk'
import { nearestBuildingId } from '../engine/proximity'
import { renderStaticWorld } from '../engine/renderTown'
import { drawPlayer, drawTownsperson } from '../art/drawSprites'

interface UseGameLoopArgs {
  canvasRef: React.RefObject<HTMLCanvasElement>
  /** Ids of currently-unlocked buildings (affects facade dimming). */
  unlockedIds: string[]
  /** True while an overlay is open — freezes movement + the loop's interact. */
  paused: boolean
  /** Called when the player presses E/Enter near a building door. */
  onInteract: (buildingId: string) => void
  /** Reports the building currently in range (for the on-screen prompt). */
  onNearChange: (buildingId: string | null) => void
}

/**
 * Drives the whole town: an rAF loop that steps the player + townsfolk, draws
 * the cached static world plus animated sprites, and runs a side-scrolling
 * camera that keeps the player roughly centered.
 */
export function useGameLoop({
  canvasRef,
  unlockedIds,
  paused,
  onInteract,
  onNearChange,
}: UseGameLoopArgs) {
  const playerRef = useRef<PlayerState>(spawnPlayer())
  const folkRef = useRef<WandererState[]>(spawnTownsfolk())
  const nearRef = useRef<string | null>(null)
  const staticRef = useRef<HTMLCanvasElement | null>(null)
  const pausedRef = useRef(paused)

  // keep mutable refs in sync with props without restarting the loop
  pausedRef.current = paused

  const onInteractRef = useRef(onInteract)
  const onNearChangeRef = useRef(onNearChange)
  onInteractRef.current = onInteract
  onNearChangeRef.current = onNearChange

  // (Re)build the cached static world whenever unlock state changes.
  // The draw loop reads staticRef each frame, so no re-render is needed.
  useEffect(() => {
    staticRef.current = renderStaticWorld(new Set(unlockedIds))
  }, [unlockedIds])

  // input
  useEffect(() => {
    const input = createInput({
      isEnabled: () => !pausedRef.current,
      onInteract: () => {
        const near = nearRef.current
        if (near) onInteractRef.current(near)
      },
    })

    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (!pausedRef.current) {
        playerRef.current = stepPlayer(playerRef.current, input.state, dt)
        folkRef.current = stepTownsfolk(folkRef.current, dt)

        const near = nearestBuildingId(playerRef.current)
        if (near !== nearRef.current) {
          nearRef.current = near
          onNearChangeRef.current(near)
        }
      }

      draw()
      raf = requestAnimationFrame(tick)
    }

    const draw = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      const stat = staticRef.current
      if (!canvas || !ctx || !stat) return

      const viewW = canvas.width / SCALE
      const viewH = canvas.height / SCALE

      // camera: center on player, clamped to world bounds
      const p = playerRef.current
      const camX = clamp(p.x + PLAYER_W / 2 - viewW / 2, 0, Math.max(0, WORLD_W - viewW))
      const camY = clamp(0, 0, Math.max(0, WORLD_H - viewH)) // street is short; pin to top

      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(SCALE, SCALE)
      ctx.translate(-camX, -camY)

      // static world
      ctx.drawImage(stat, 0, 0)

      // townsfolk (feet at their y)
      for (const w of folkRef.current) {
        drawTownsperson(ctx, w.x, w.y, w.color, w.facing, wandererStep(w))
      }

      // player
      drawPlayer(ctx, p.x, p.y, p.facing, walkStep(p))

      ctx.restore()
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      input.dispose()
    }
    // canvasRef is stable; loop reads everything else via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
