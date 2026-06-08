import { useState } from 'react'

interface LeverGameProps {
  onSuccess: () => void
}

type Schedule = 'continuous' | 'fixed' | 'variable'

const NEXT_LABEL: Record<Schedule, string> = {
  continuous: 'Continuous (reward every press)',
  fixed: 'Fixed-ratio (reward every 4th press)',
  variable: 'Variable-ratio (reward ~1 in 4, unpredictable)',
}

/** Skinner: press the lever under different reinforcement schedules. */
export function LeverGame({ onSuccess }: LeverGameProps) {
  const [schedule, setSchedule] = useState<Schedule>('variable')
  const [presses, setPresses] = useState(0)
  const [rewards, setRewards] = useState(0)
  const [flash, setFlash] = useState(false)
  const [acted, setActed] = useState(false)

  const press = () => {
    const n = presses + 1
    setPresses(n)
    let pay = false
    if (schedule === 'continuous') pay = true
    else if (schedule === 'fixed') pay = n % 4 === 0
    else pay = Math.random() < 0.25 // variable ratio ~1/4

    if (pay) {
      setRewards((r) => r + 1)
      setFlash(true)
      window.setTimeout(() => setFlash(false), 180)
    }
    if (!acted) {
      setActed(true)
      onSuccess()
    }
  }

  const pick = (s: Schedule) => {
    setSchedule(s)
    setPresses(0)
    setRewards(0)
  }

  const rate = presses ? Math.round((rewards / presses) * 100) : 0

  return (
    <div className="mg">
      <p className="mg__hint">
        Press the lever and feel the difference. The <strong>variable-ratio</strong>{' '}
        schedule — unpredictable payoff — is the hardest habit to quit. It is the
        engine inside every slot machine.
      </p>
      <div className="lever-schedules">
        {(['continuous', 'fixed', 'variable'] as Schedule[]).map((s) => (
          <button
            key={s}
            className={`pixel-btn${schedule === s ? ' pixel-btn--primary' : ''}`}
            onClick={() => pick(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mg__stat">{NEXT_LABEL[schedule]}</p>
      <button
        className={`lever-btn${flash ? ' lever-btn--reward' : ''}`}
        onClick={press}
      >
        {flash ? '🍪 REWARD!' : 'PRESS LEVER'}
      </button>
      <p className="mg__stat">
        Presses: {presses} · Rewards: {rewards} · Payoff rate: {rate}%
      </p>
    </div>
  )
}
