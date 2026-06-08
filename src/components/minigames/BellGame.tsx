import { useRef, useState } from 'react'

interface BellGameProps {
  onSuccess: () => void
}

/**
 * Pavlov: ring the bell to restock. Each ring while "conditioned" restocks; but
 * ringing repeatedly without the food pairing drives the response toward
 * extinction (diminishing restock), demonstrating the learning curve.
 */
export function BellGame({ onSuccess }: BellGameProps) {
  const [stock, setStock] = useState(0)
  const [strength, setStrength] = useState(1) // conditioned response strength 0..1
  const [rings, setRings] = useState(0)
  const [log, setLog] = useState('Ring the bell to condition the shop.')
  const succeeded = useRef(false)

  const ring = () => {
    const restock = Math.round(strength * 8)
    setStock((s) => s + restock)
    setRings((r) => r + 1)
    // each unpaired ring weakens the response (extinction)
    const nextStrength = Math.max(0, strength - 0.12)
    setStrength(nextStrength)
    if (restock <= 0) {
      setLog('Extinction! The bell no longer brings food — restock is zero.')
    } else if (nextStrength < 0.4) {
      setLog(`Restocked ${restock}. The response is fading (extinction setting in)…`)
    } else {
      setLog(`Ding! Restocked ${restock} goods — strong conditioned response.`)
    }
    if (!succeeded.current && rings + 1 >= 1) {
      succeeded.current = true
      onSuccess()
    }
  }

  const pairWithFood = () => {
    // re-pairing bell with dinner reconditions: spontaneous recovery + boost
    setStrength((s) => Math.min(1, s + 0.5))
    setLog('You paired the bell with dinner — the response recovers!')
  }

  const reset = () => {
    setStock(0)
    setStrength(1)
    setRings(0)
    setLog('Ring the bell to condition the shop.')
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        Ring the bell to restock Pavlov's shelves. Keep ringing <em>without</em>{' '}
        pairing it with dinner and watch the conditioned response extinguish.
      </p>
      <div className="bell-meter">
        <span>Response strength</span>
        <div className="bell-bar">
          <div className="bell-bar__fill" style={{ width: `${strength * 100}%` }} />
        </div>
      </div>
      <div className="bell-actions">
        <button className="pixel-btn pixel-btn--primary" onClick={ring}>
          🔔 Ring the bell
        </button>
        <button className="pixel-btn" onClick={pairWithFood}>
          🍖 Pair with dinner
        </button>
        <button className="pixel-btn" onClick={reset}>
          Reset
        </button>
      </div>
      <p className="mg__stat">
        Stock: {stock} · Rings: {rings}
      </p>
      <p className="mg__log">{log}</p>
    </div>
  )
}
