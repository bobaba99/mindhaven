import { useRef, useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import {
  FORGETTING_CURVE,
  SYLLABLE_TARGETS,
  buildRecallBank,
  scoreRecall,
  summarizeSavings,
} from '../../engine/minigames/ebbinghaus'

interface EbbinghausGameProps {
  onSuccess: () => void
}

type Phase = 'learn' | 'stale' | 'recall' | 'done'

const HOURS_LABELS: Record<number, string> = {
  [1 / 3]: '20 min',
  1: '1 hour',
  9: '9 hours',
  24: '1 day',
  144: '6 days',
  744: '31 days',
}

/** Ebbinghaus: learn the morning batch, watch it stale on the 1885 curve. */
export function EbbinghausGame({ onSuccess }: EbbinghausGameProps) {
  const [phase, setPhase] = useState<Phase>('learn')
  const [bank] = useState(() => buildRecallBank(shuffle))
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set())
  const rewarded = useRef(false)

  const togglePick = (syllable: string) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(syllable)) next.delete(syllable)
      else next.add(syllable)
      return next
    })
  }

  const submit = () => {
    setPhase('done')
    if (!rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }

  if (phase === 'learn') {
    return (
      <div className="mg">
        <p className="mg__hint">
          The morning batch, labeled the 1885 way — in syllables that{' '}
          <em>mean nothing</em>, so no prior memory can help you.
        </p>
        <div className="ebbinghaus-tray">
          {SYLLABLE_TARGETS.map((s) => (
            <span key={s} className="ebbinghaus-bun">
              🥖 {s}
            </span>
          ))}
        </div>
        <p className="mg__hint">Study the four labels. They go on the shelf next.</p>
        <button
          className="pixel-btn pixel-btn--primary"
          onClick={() => setPhase('stale')}
        >
          Shelve the batch
        </button>
      </div>
    )
  }

  if (phase === 'stale') {
    return (
      <div className="mg">
        <p className="mg__hint">
          The afternoon passes. My stock goes stale on the very curve I
          measured in 1885 — steep at first, then stubbornly flat:
        </p>
        <ul className="ebbinghaus-curve">
          {FORGETTING_CURVE.map((p) => (
            <li key={p.hours}>
              <span className="ebbinghaus-curve__label">{HOURS_LABELS[p.hours]}</span>
              <span
                className="ebbinghaus-curve__bar"
                style={{ width: `${p.retention * 100}%` }}
              />
              <span className="ebbinghaus-curve__pct">{Math.round(p.retention * 100)}%</span>
            </li>
          ))}
        </ul>
        <button
          className="pixel-btn pixel-btn--primary"
          onClick={() => setPhase('recall')}
        >
          Back to the counter — which were ours?
        </button>
      </div>
    )
  }

  if (phase === 'recall') {
    return (
      <div className="mg">
        <p className="mg__hint">
          Pick out the morning batch from the whole shelf. No guessing penalty
          — but the decoys are baked to confuse.
        </p>
        <div className="kahneman-options">
          {bank.map((item) => (
            <button
              key={item.syllable}
              className={`pixel-btn${picked.has(item.syllable) ? ' kahneman-opt--correct' : ''}`}
              aria-pressed={picked.has(item.syllable)}
              onClick={() => togglePick(item.syllable)}
            >
              🥖 {item.syllable}
            </button>
          ))}
        </div>
        <button
          className="pixel-btn pixel-btn--primary"
          onClick={submit}
          disabled={picked.size === 0}
        >
          Ring them up ({picked.size} picked)
        </button>
      </div>
    )
  }

  const score = scoreRecall(picked)
  return (
    <div className="mg">
      <p className="mg__stat">
        🥖 Recalled {score.hits}/{SYLLABLE_TARGETS.length}
        {score.falseAlarms > 0 ? ` · ${score.falseAlarms} decoy${score.falseAlarms === 1 ? '' : 's'} rung up` : ''}
      </p>
      <div className="kahneman-explain">
        <p>{summarizeSavings(score.hits)}</p>
      </div>
    </div>
  )
}
