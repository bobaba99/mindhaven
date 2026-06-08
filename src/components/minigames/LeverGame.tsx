import { useEffect, useRef, useState } from 'react'

interface LeverGameProps {
  onSuccess: () => void
}

type Schedule = 'continuous' | 'fixed' | 'variable'

const SCHEDULES: readonly Schedule[] = ['continuous', 'fixed', 'variable']

/** ms the reward flash stays lit after a paying lever press. */
const REWARD_FLASH_MS = 180
/** Fixed-ratio: reward on every Nth press. */
const FIXED_RATIO = 4
/** Variable-ratio: payoff probability per press (~1 in 4). */
const VARIABLE_RATIO_P = 0.25

const NEXT_LABEL: Record<Schedule, string> = {
  continuous: 'Continuous (reward every press)',
  fixed: `Fixed-ratio (reward every ${FIXED_RATIO}th press)`,
  variable: 'Variable-ratio (reward ~1 in 4, unpredictable)',
}

/** Skinner: press the lever under different reinforcement schedules. */
export function LeverGame({ onSuccess }: LeverGameProps) {
  const [schedule, setSchedule] = useState<Schedule>('variable')
  const [presses, setPresses] = useState(0)
  const [rewards, setRewards] = useState(0)
  const [flash, setFlash] = useState(false)
  const [acted, setActed] = useState(false)
  const flashTimer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  const press = () => {
    const n = presses + 1
    setPresses(n)
    let pay = false
    if (schedule === 'continuous') pay = true
    else if (schedule === 'fixed') pay = n % FIXED_RATIO === 0
    else pay = Math.random() < VARIABLE_RATIO_P

    if (pay) {
      setRewards((r) => r + 1)
      setFlash(true)
      window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlash(false), REWARD_FLASH_MS)
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
        {SCHEDULES.map((s) => (
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
