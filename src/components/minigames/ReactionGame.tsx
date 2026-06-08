import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'tooSoon'

interface ReactionGameProps {
  onSuccess: () => void
}

/** Wundt: tap when the lamp flashes; measures reaction time. */
export function ReactionGame({ onSuccess }: ReactionGameProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [ms, setMs] = useState<number | null>(null)
  const [best, setBest] = useState<number | null>(null)
  const goAt = useRef(0)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const start = () => {
    setPhase('waiting')
    setMs(null)
    const delay = 900 + Math.random() * 2200
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now()
      setPhase('go')
    }, delay)
  }

  const tap = () => {
    if (phase === 'idle' || phase === 'result' || phase === 'tooSoon') {
      start()
      return
    }
    if (phase === 'waiting') {
      window.clearTimeout(timer.current)
      setPhase('tooSoon')
      return
    }
    if (phase === 'go') {
      const rt = Math.round(performance.now() - goAt.current)
      setMs(rt)
      setBest((b) => (b === null ? rt : Math.min(b, rt)))
      setPhase('result')
      onSuccess()
    }
  }

  const label =
    phase === 'idle'
      ? 'Click to begin'
      : phase === 'waiting'
        ? 'Wait for the lamp…'
        : phase === 'go'
          ? 'NOW! Click!'
          : phase === 'tooSoon'
            ? 'Too soon! Click to retry'
            : `${ms} ms — click to try again`

  return (
    <div className="mg">
      <p className="mg__hint">
        Wundt's reaction-time clock. Watch the lamp; click the instant it turns
        bright. Anticipating it ("waiting") is a false start.
      </p>
      <button
        className={`reaction-lamp reaction-lamp--${phase}`}
        onClick={tap}
        aria-label="reaction lamp"
      >
        <span className="reaction-lamp__bulb" />
        <span className="reaction-lamp__label">{label}</span>
      </button>
      {best !== null && <p className="mg__stat">Best: {best} ms</p>}
    </div>
  )
}
