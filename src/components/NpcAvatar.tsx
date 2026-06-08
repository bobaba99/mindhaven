import { useEffect, useRef } from 'react'

/** Deterministic palette per figure name so each portrait is distinct. */
function paletteFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  const hair = `hsl(${(hue + 20) % 360} 40% 28%)`
  const coat = `hsl(${hue} 35% 45%)`
  const coatDark = `hsl(${hue} 35% 33%)`
  return { hair, coat, coatDark }
}

interface NpcAvatarProps {
  /** Figure name used as the deterministic seed + initials. */
  name: string
  size?: number
}

/**
 * A small procedural pixel portrait of the NPC (scholar with coat + hair),
 * drawn to a canvas. No external assets; distinct per figure.
 */
export function NpcAvatar({ name, size = 64 }: NpcAvatarProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const S = 16 // internal grid
    canvas.width = S
    canvas.height = S
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, S, S)

    const { hair, coat, coatDark } = paletteFor(name)
    const skin = '#f0c89a'

    const px = (x: number, y: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c
      ctx.fillRect(x, y, w, h)
    }

    // backdrop disc
    px(0, 0, S, S, '#2e2a3a')
    ctx.fillStyle = '#3c4a55'
    ctx.beginPath()
    ctx.arc(S / 2, S / 2 + 2, 8, 0, Math.PI * 2)
    ctx.fill()

    // shoulders / coat
    px(3, 12, 10, 4, coat)
    px(3, 12, 10, 1, coatDark)
    px(7, 12, 2, 4, '#f4ecd8') // collar/shirt
    // neck
    px(7, 10, 2, 2, skin)
    // head
    px(5, 4, 6, 6, skin)
    // hair
    px(5, 3, 6, 2, hair)
    px(4, 4, 1, 3, hair)
    px(11, 4, 1, 3, hair)
    // eyes + brow
    px(6, 6, 1, 1, '#2a1c10')
    px(9, 6, 1, 1, '#2a1c10')
    // tiny beard hint for some (deterministic)
    if (name.length % 2 === 0) px(6, 9, 4, 1, hair)
  }, [name])

  return (
    <canvas
      ref={ref}
      className="npc-avatar"
      style={{ width: size, height: size }}
      aria-label={`Portrait of ${name}`}
    />
  )
}
