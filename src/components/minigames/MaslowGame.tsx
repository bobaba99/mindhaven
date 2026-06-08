import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../../engine/shuffle'

interface MaslowGameProps {
  onSuccess: () => void
}

/** ms the "toppled" state shows before the cake resets. */
const TOPPLE_RESET_MS = 900

interface Tier {
  id: string
  label: string
  color: string
}

/** Bottom -> top, the correct stacking order. */
const TIERS: Tier[] = [
  { id: 'physiological', label: 'Physiological (food, water, rest)', color: '#c25a3a' },
  { id: 'safety', label: 'Safety (security, shelter)', color: '#d08a3a' },
  { id: 'love', label: 'Love & Belonging', color: '#caa23a' },
  { id: 'esteem', label: 'Esteem (respect, achievement)', color: '#6a9a4a' },
  { id: 'actualization', label: 'Self-Actualization', color: '#4a7a9a' },
]

/** Maslow: stack the needs-cake bottom-up in the correct order. */
export function MaslowGame({ onSuccess }: MaslowGameProps) {
  const [pool, setPool] = useState<Tier[]>(() => shuffle(TIERS))
  const [stack, setStack] = useState<Tier[]>([])
  const [toppled, setToppled] = useState(false)
  const resetTimer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const place = (tier: Tier) => {
    if (toppled) return
    const expected = TIERS[stack.length]
    if (tier.id === expected.id) {
      const nextStack = [...stack, tier]
      setStack(nextStack)
      setPool((p) => p.filter((t) => t.id !== tier.id))
      if (nextStack.length === TIERS.length) onSuccess()
    } else {
      // wrong tier -> topple, restart
      setToppled(true)
      resetTimer.current = window.setTimeout(() => {
        setStack([])
        setPool(shuffle(TIERS))
        setToppled(false)
      }, TOPPLE_RESET_MS)
    }
  }

  const done = stack.length === TIERS.length

  return (
    <div className="mg">
      <p className="mg__hint">
        Build Maslow's needs-cake from the base up. Place a tier out of order and
        the cake topples — lower needs must be steady before higher ones.
      </p>
      <div className={`maslow-cake${toppled ? ' maslow-cake--topple' : ''}`}>
        {[...stack].reverse().map((t, i) => (
          <div
            key={t.id}
            className="maslow-tier"
            style={{
              background: t.color,
              width: `${60 + (stack.length - 1 - (stack.length - 1 - i)) * 8}%`,
            }}
          >
            {t.label}
          </div>
        ))}
        {stack.length === 0 && !toppled && <p className="maslow-empty">Empty plate…</p>}
        {toppled && <p className="maslow-empty">💥 Toppled! Rebuilding…</p>}
      </div>
      {!done && (
        <div className="maslow-pool">
          {pool.map((t) => (
            <button key={t.id} className="pixel-btn" onClick={() => place(t)}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {done && <p className="mg__stat">🎂 Pyramid complete — the whole town is fed!</p>}
    </div>
  )
}
