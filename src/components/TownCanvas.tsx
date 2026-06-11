import { useEffect, useRef, useState } from 'react'
import { SCALE, WORLD_H } from '../engine/world'
import { useGameLoop } from '../hooks/useGameLoop'
import { InteractPrompt } from './InteractPrompt'
import { TouchControls } from './TouchControls'
import { BUILDINGS } from '../data/buildings'

const BUILDING_NAME = new Map(BUILDINGS.map((b) => [b.id, b.name]))

interface TownCanvasProps {
  unlockedIds: string[]
  paused: boolean
  onInteract: (buildingId: string) => void
}

/**
 * Full-bleed canvas that renders Wundt Way. The canvas backing store is sized
 * to the viewport (times SCALE for crisp pixels); the camera scrolls the world.
 */
export function TownCanvas({ unlockedIds, paused, onInteract }: TownCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState<string | null>(null)

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
      const cssW = Math.floor(wrap.clientWidth)
      // cap drawn height to the world so we never show empty space below
      const worldPx = WORLD_H * SCALE
      const cssH = Math.floor(Math.min(wrap.clientHeight, worldPx))
      canvas.width = cssW * dpr
      canvas.height = cssH * dpr
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const touch = useGameLoop({
    canvasRef,
    unlockedIds,
    paused,
    onInteract,
    onNearChange: setNear,
  })

  return (
    <div ref={wrapRef} className="town-canvas-wrap">
      <canvas ref={canvasRef} className="town-canvas" />
      {near && !paused && (
        <InteractPrompt
          label={BUILDING_NAME.get(near) ?? 'this shop'}
          locked={!unlockedIds.includes(near)}
        />
      )}
      {!paused && <TouchControls controls={touch} />}
    </div>
  )
}
