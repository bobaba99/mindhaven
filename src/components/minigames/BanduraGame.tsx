import { useEffect, useRef, useState } from 'react'
import {
  MOVES,
  ROUNDS_TO_MASTER,
  checkReproduction,
  efficacyGain,
  generateSequence,
  sequenceLengthFor,
  type Move,
} from '../../engine/minigames/bandura'

interface BanduraGameProps {
  onSuccess: () => void
}

const MOVE_ICONS: Record<Move, string> = {
  Jab: '🥊',
  Duck: '🙇',
  Hook: '🤛',
  Step: '👣',
}

/** ms each demonstrated move stays on screen during the watch phase. */
const FLASH_MS = 700

const TOTAL_XP = Array.from({ length: ROUNDS_TO_MASTER }, (_, i) => efficacyGain(i + 1)).reduce(
  (a, b) => a + b,
  0,
)

type Phase = 'idle' | 'watch' | 'reproduce' | 'mastered'

/** Bandura: watch the trainer's combo, then reproduce it from memory. */
export function BanduraGame({ onSuccess }: BanduraGameProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [round, setRound] = useState(1)
  const [target, setTarget] = useState<Move[]>([])
  const [flashIdx, setFlashIdx] = useState(-1)
  const [attempt, setAttempt] = useState<Move[]>([])
  const [xp, setXp] = useState(0)
  const [note, setNote] = useState('')
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const startWatch = (forRound: number, seq?: Move[]) => {
    const sequence = seq ?? generateSequence(sequenceLengthFor(forRound), Math.random)
    setTarget(sequence)
    setAttempt([])
    setNote('')
    setPhase('watch')
    setFlashIdx(0)
    window.clearInterval(timer.current)
    let i = 0
    timer.current = window.setInterval(() => {
      i += 1
      if (i >= sequence.length) {
        window.clearInterval(timer.current)
        setFlashIdx(-1)
        setPhase('reproduce')
      } else {
        setFlashIdx(i)
      }
    }, FLASH_MS)
  }

  const press = (move: Move) => {
    if (phase !== 'reproduce') return
    const nextAttempt = [...attempt, move]
    const verdict = checkReproduction(target, nextAttempt)
    if (verdict === 'fail') {
      setAttempt([])
      setNote('The mirror neurons misfired — watch the trainer once more.')
      startWatch(round, target)
      return
    }
    setAttempt(nextAttempt)
    if (verdict === 'success') {
      const gained = efficacyGain(round)
      setXp((x) => x + gained)
      if (round >= ROUNDS_TO_MASTER) {
        setPhase('mastered')
        onSuccess()
      } else {
        setNote(`Clean reproduction! +${gained} self-efficacy.`)
        setRound((r) => r + 1)
        setPhase('idle')
      }
    }
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        Bandura's four steps: <em>attend</em> to the trainer, <em>retain</em>{' '}
        the combo, <em>reproduce</em> it, and let each success feed{' '}
        <em>motivation</em>. No rewards needed to learn — only to perform.
      </p>
      <div className="bell-meter">
        Self-efficacy: {xp}/{TOTAL_XP}
        <div className="bell-bar">
          <div className="bell-bar__fill" style={{ width: `${(xp / TOTAL_XP) * 100}%` }} />
        </div>
      </div>

      {phase === 'idle' && (
        <button className="pixel-btn pixel-btn--primary" onClick={() => startWatch(round)}>
          Round {round} of {ROUNDS_TO_MASTER}: watch the trainer (
          {sequenceLengthFor(round)} moves)
        </button>
      )}

      {phase === 'watch' && flashIdx >= 0 && (
        <div className="bandura-flash" role="status" aria-label={`Trainer move: ${target[flashIdx]}`}>
          <span className="bandura-flash__icon">{MOVE_ICONS[target[flashIdx]]}</span>
          <span>{target[flashIdx]}</span>
          <span className="bandura-flash__count">
            {flashIdx + 1}/{target.length}
          </span>
        </div>
      )}

      {phase === 'reproduce' && (
        <>
          <p className="mg__stat">
            Your turn — reproduce all {target.length} moves ({attempt.length} so far):
          </p>
          <div className="bandura-pads">
            {MOVES.map((m) => (
              <button key={m} className="pixel-btn" onClick={() => press(m)}>
                {MOVE_ICONS[m]} {m}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'mastered' && (
        <p className="mg__stat">
          💪 Combo mastered through observation alone — the Bobo doll never
          stood a chance. Self-efficacy: full.
        </p>
      )}

      <p className="mg__log" role="status">
        {note}
      </p>
    </div>
  )
}
