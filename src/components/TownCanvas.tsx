import { useEffect, useRef, useState } from 'react'
import { SCALE, WORLD_H } from '../engine/world'
import { useGameLoop } from '../hooks/useGameLoop'
import { InteractPrompt } from './InteractPrompt'
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

  // Resize the canvas backing store to match the wrapper, at integer scale.
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (!canvas || !wrap) return
      const w = wrap.clientWidth
      // cap drawn height to the world so we never show empty space below
      const worldPx = WORLD_H * SCALE
      const h = Math.min(wrap.clientHeight, worldPx)
      canvas.width = Math.floor(w)
      canvas.height = Math.floor(h)
      canvas.style.width = `${Math.floor(w)}px`
      canvas.style.height = `${Math.floor(h)}px`
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useGameLoop({
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
    </div>
  )
}
