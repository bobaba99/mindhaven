import { useEffect, useRef } from 'react'
import {
  SCALE,
  PLAYER_W,
  layoutFor,
  spawnXFor,
  type District,
} from '../engine/world'
import { createInput, type InputController, type MoveKey } from '../engine/input'
import type { TouchControlsHandle } from '../components/TouchControls'
import {
  playerCenter,
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
import { nearestInteractable, type Interactable } from '../engine/proximity'
import { setMusicDrift } from '../engine/music'
import { renderStaticWorld } from '../engine/renderTown'
import { drawSignOverlay } from '../engine/signOverlay'
import { drawPlayer, drawTownsperson } from '../art/drawSprites'

interface UseGameLoopArgs {
  canvasRef: React.RefObject<HTMLCanvasElement>
  /** Ids of currently-unlocked buildings (affects facade dimming). */
  unlockedIds: string[]
  /** Which street the player is on. */
  district: District
  /** Whether the Memory Lane gate threshold has been reached. */
  gateOpen: boolean
  /** True while an overlay is open — freezes movement + the loop's interact. */
  paused: boolean
  /** Called when the player presses E/Enter near a door, wanderer, or gate. */
  onInteract: (target: Interactable) => void
  /** Reports the interactable currently in range (for the on-screen prompt). */
  onNearChange: (target: Interactable | null) => void
}

/**
 * Drives the whole town: an rAF loop that steps the player + townsfolk, draws
 * the cached static world plus animated sprites, and runs a side-scrolling
 * camera that keeps the player roughly centered. District changes respawn the
 * player at the right entrance and swap the cached static world. Returns a
 * stable handle the touch controls can drive.
 */
export function useGameLoop({
  canvasRef,
  unlockedIds,
  district,
  gateOpen,
  paused,
  onInteract,
  onNearChange,
}: UseGameLoopArgs): TouchControlsHandle {
  const playerRef = useRef<PlayerState>(spawnPlayer())
  const folkRef = useRef<WandererState[]>(spawnTownsfolk())
  const nearRef = useRef<Interactable | null>(null)
  const staticRef = useRef<HTMLCanvasElement | null>(null)
  const pausedRef = useRef(paused)
  const districtRef = useRef<District>(district)
  const inputRef = useRef<InputController | null>(null)

  // keep mutable refs in sync with props without restarting the loop
  pausedRef.current = paused

  // When an overlay pauses the game the touch D-pad unmounts mid-gesture and
  // its pointerup may never fire — clear held directions so the player can't
  // resume auto-walking a direction nobody is pressing.
  useEffect(() => {
    if (paused) inputRef.current?.releaseAll()
  }, [paused])

  const onInteractRef = useRef(onInteract)
  const onNearChangeRef = useRef(onNearChange)
  onInteractRef.current = onInteract
  onNearChangeRef.current = onNearChange

  // Crossing a gate: respawn at the destination's entrance, clear the prompt,
  // and (main street only) repopulate the wanderers.
  const prevDistrictRef = useRef<District>(district)
  useEffect(() => {
    if (prevDistrictRef.current === district) return
    const cameFrom = prevDistrictRef.current
    prevDistrictRef.current = district
    districtRef.current = district
    playerRef.current = spawnPlayer(spawnXFor(district, cameFrom))
    folkRef.current = district === 'main' ? spawnTownsfolk() : []
    inputRef.current?.releaseAll()
    nearRef.current = null
    onNearChangeRef.current(null)
  }, [district])

  // (Re)build the cached static world whenever unlock/district/gate changes.
  // The draw loop reads staticRef each frame, so no re-render is needed.
  const unlockedSetRef = useRef<ReadonlySet<string>>(new Set(unlockedIds))
  const gateOpenRef = useRef(gateOpen)
  useEffect(() => {
    const set = new Set(unlockedIds)
    unlockedSetRef.current = set
    gateOpenRef.current = gateOpen
    districtRef.current = district
    staticRef.current = renderStaticWorld(set, district, gateOpen)
  }, [unlockedIds, district, gateOpen])

  // input
  useEffect(() => {
    const input = createInput({
      isEnabled: () => !pausedRef.current,
      onInteract: () => {
        const near = nearRef.current
        if (near) onInteractRef.current(near)
      },
    })
    inputRef.current = input

    let raf = 0
    let last = performance.now()

    // Cache the 2D context (and which canvas it belongs to) so we don't call
    // getContext on every frame.
    let cachedCanvas: HTMLCanvasElement | null = null
    let cachedCtx: CanvasRenderingContext2D | null = null
    const getCtx = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
      if (cachedCanvas !== canvas) {
        cachedCanvas = canvas
        cachedCtx = canvas.getContext('2d')
      }
      return cachedCtx
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      if (!pausedRef.current) {
        const layout = layoutFor(districtRef.current)
        playerRef.current = stepPlayer(
          playerRef.current,
          input.state,
          dt,
          layout.worldW,
        )
        const { cx, cy } = playerCenter(playerRef.current)
        folkRef.current = stepTownsfolk(folkRef.current, dt, { x: cx, y: cy })

        // The town theme drifts with the player's place on the century
        // street. Memory Lane sits in the cognitive stretch of the timeline,
        // so its short walk maps into the warmer 0.55–0.85 band.
        const norm = playerRef.current.x / (layout.worldW - PLAYER_W)
        setMusicDrift(
          districtRef.current === 'main' ? norm : 0.55 + 0.3 * norm,
        )

        const near = nearestInteractable(
          playerRef.current,
          folkRef.current,
          districtRef.current,
        )
        const prev = nearRef.current
        if (near?.id !== prev?.id || near?.kind !== prev?.kind) {
          nearRef.current = near
          onNearChangeRef.current(near)
        }
      }

      draw()
      raf = requestAnimationFrame(tick)
    }

    const draw = () => {
      const canvas = canvasRef.current
      const stat = staticRef.current
      if (!canvas || !stat) return
      const ctx = getCtx(canvas)
      if (!ctx) return

      // Backing store is CSS pixels × devicePixelRatio; recover the DPR so we
      // draw at logical scale (SCALE) while filling the crisp hi-DPI buffer.
      const cssW = parseFloat(canvas.style.width) || canvas.width
      const dpr = canvas.width / cssW
      const drawScale = SCALE * dpr
      const viewW = canvas.width / drawScale
      const worldW = layoutFor(districtRef.current).worldW

      // camera: center on player horizontally, clamped to world bounds. The
      // street is short, so the vertical camera is pinned to the top (camY = 0).
      const p = playerRef.current
      const camX = clamp(p.x + PLAYER_W / 2 - viewW / 2, 0, Math.max(0, worldW - viewW))
      const camY = 0

      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(drawScale, drawScale)
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

      // crisp text pass: building names + lock costs at device resolution
      drawSignOverlay(ctx, {
        camX,
        dpr,
        viewCssW: cssW,
        unlockedIds: unlockedSetRef.current,
        district: districtRef.current,
        gateOpen: gateOpenRef.current,
      })
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      input.dispose()
      inputRef.current = null
    }
    // canvasRef is stable; loop reads everything else via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stable proxy so TouchControls never re-renders when the input rebinds.
  const touchHandleRef = useRef<TouchControlsHandle>({
    press: (key: MoveKey) => inputRef.current?.press(key),
    release: (key: MoveKey) => inputRef.current?.release(key),
    interact: () => inputRef.current?.interact(),
  })
  return touchHandleRef.current
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
