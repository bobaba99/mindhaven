import { useEffect, useRef, useState } from 'react'
import { SCALE, WORLD_H, layoutFor, type District } from '../engine/world'
import { useGameLoop } from '../hooks/useGameLoop'
import { GATE_TO_LANE, type Interactable } from '../engine/proximity'
import { InteractPrompt } from './InteractPrompt'
import { TouchControls } from './TouchControls'
import { ALL_BUILDINGS, TOWNSFOLK } from '../data/buildings'

const BUILDING_NAME = new Map(ALL_BUILDINGS.map((b) => [b.id, b.name]))
const FOLK_NAME = new Map(TOWNSFOLK.map((t) => [t.id, t.name]))
const GATE_NAME: Record<string, string> = {
  [GATE_TO_LANE]: 'Memory Lane',
  'wundt-way': 'Wundt Way',
}

interface TownCanvasProps {
  unlockedIds: string[]
  district: District
  /** Whether the Memory Lane gate threshold has been reached. */
  gateOpen: boolean
  paused: boolean
  onInteract: (target: Interactable) => void
  /** Optional observer for the interactable currently in range. */
  onNearChange?: (target: Interactable | null) => void
}

/**
 * Full-bleed canvas that renders Wundt Way. The canvas backing store is sized
 * to the viewport (times SCALE for crisp pixels); the camera scrolls the world.
 */
export function TownCanvas({
  unlockedIds,
  district,
  gateOpen,
  paused,
  onInteract,
  onNearChange,
}: TownCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState<Interactable | null>(null)
  const onNearChangeRef = useRef(onNearChange)
  onNearChangeRef.current = onNearChange

  // Resize the canvas. The CSS box is sized in logical (layout) pixels; the
  // backing store is logical × devicePixelRatio so pixel art stays crisp on
  // Retina / high-DPI screens instead of being upscaled and blurred. The game
  // loop reads the DPR back from (backing width / CSS width).
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (!canvas || !wrap) return
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
      // cap drawn width/height to the district's world so we never show blank
      // canvas past its edges — Memory Lane is narrower than a wide desktop
      // viewport, and the wrap's flex centering letterboxes it like a stage.
      const worldWPx = layoutFor(district).worldW * SCALE
      const worldHPx = WORLD_H * SCALE
      const cssW = Math.floor(Math.min(wrap.clientWidth, worldWPx))
      const cssH = Math.floor(Math.min(wrap.clientHeight, worldHPx))
      canvas.width = cssW * dpr
      canvas.height = cssH * dpr
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [district])

  const touch = useGameLoop({
    canvasRef,
    unlockedIds,
    district,
    gateOpen,
    paused,
    onInteract,
    onNearChange: (id) => {
      setNear(id)
      onNearChangeRef.current?.(id)
    },
  })

  return (
    <div ref={wrapRef} className="town-canvas-wrap">
      <canvas ref={canvasRef} className="town-canvas" />
      {near && !paused && (
        <InteractPrompt
          label={
            near.kind === 'townsperson'
              ? FOLK_NAME.get(near.id) ?? 'this wanderer'
              : near.kind === 'gate'
                ? GATE_NAME[near.id] ?? 'the gate'
                : BUILDING_NAME.get(near.id) ?? 'this shop'
          }
          locked={
            (near.kind === 'building' && !unlockedIds.includes(near.id)) ||
            (near.kind === 'gate' && near.id === GATE_TO_LANE && !gateOpen)
          }
          verb={near.kind === 'townsperson' ? 'talk' : 'enter'}
        />
      )}
      {!paused && <TouchControls controls={touch} />}
    </div>
  )
}
