import { useEffect, useRef, useState } from 'react'
import {
  ASCH_ROUNDS,
  scoreChoice,
  summarizeAsch,
  type AschResult,
} from '../../engine/minigames/asch'

interface AschGameProps {
  onSuccess: () => void
}

const LETTERS = ['A', 'B', 'C'] as const
/** Bar width per line-length unit (percent). */
const UNIT_WIDTH_PCT = 8

/** Asch: judge the lines while a planted audience answers first — and wrong. */
export function AschGame({ onSuccess }: AschGameProps) {
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState<0 | 1 | 2 | null>(null)
  const [results, setResults] = useState<AschResult[]>([])
  const rewarded = useRef(false)

  const finished = idx >= ASCH_ROUNDS.length
  const round = finished ? null : ASCH_ROUNDS[idx]

  useEffect(() => {
    if (finished && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [finished, onSuccess])

  const choose = (i: 0 | 1 | 2) => {
    if (!round || chosen !== null) return
    setChosen(i)
    setResults((r) => [...r, scoreChoice(round, i)])
  }

  const next = () => {
    setChosen(null)
    setIdx((i) => i + 1)
  }

  if (finished) {
    const summary = summarizeAsch(results)
    return (
      <div className="mg">
        <p className="mg__stat">
          🎭 Curtain. Independent rounds: {summary.independent} · conformed:{' '}
          {summary.conformed}.
        </p>
        <div className="kahneman-explain">
          <p>{summary.message}</p>
          <p>
            And the Milgram half of tonight's bill? We <em>tell</em> that one
            rather than stage it: real participants believed they were giving
            real shocks, and their distress rewrote the rulebook — informed
            consent, the right to stop, and the debrief you're reading now.
          </p>
        </div>
      </div>
    )
  }

  const result = chosen !== null ? scoreChoice(round!, chosen) : null

  return (
    <div className="mg">
      <p className="mg__hint">
        Round {idx + 1} of {ASCH_ROUNDS.length}: which line matches the
        standard? The five audience members call out first.
      </p>
      <div className="asch-lines">
        <div className="asch-line">
          <span className="asch-line__label">Std</span>
          <div
            className="asch-line__bar asch-line__bar--standard"
            style={{ width: `${round!.standard * UNIT_WIDTH_PCT}%` }}
          />
        </div>
        {round!.options.map((len, i) => (
          <div className="asch-line" key={i}>
            <span className="asch-line__label">{LETTERS[i]}</span>
            <div className="asch-line__bar" style={{ width: `${len * UNIT_WIDTH_PCT}%` }} />
          </div>
        ))}
      </div>
      <p className="asch-audience" role="status">
        🧍🧍🧍🧍🧍 <em>all five, without hesitation:</em>{' '}
        <strong>“{LETTERS[round!.groupAnswer]}.”</strong>
      </p>
      {chosen === null ? (
        <div className="kahneman-options">
          {LETTERS.map((letter, i) => (
            <button
              key={letter}
              className="pixel-btn"
              onClick={() => choose(i as 0 | 1 | 2)}
            >
              Line {letter}
            </button>
          ))}
        </div>
      ) : (
        <div className="kahneman-explain">
          <p>
            {result!.conformed
              ? '👥 You went with the crowd — against your own eyes. That pull is the finding.'
              : result!.correct
                ? round!.critical
                  ? '👁️ You trusted your eyes over five confident voices. Genuinely hard to do.'
                  : '✅ Correct — and this time the crowd agreed. Easy when they’re right.'
                : '🤔 Off the mark, but not with the crowd — an honest miss.'}
          </p>
          <button className="pixel-btn pixel-btn--primary" onClick={next}>
            {idx + 1 < ASCH_ROUNDS.length ? 'Next round' : 'Take a bow'}
          </button>
        </div>
      )}
    </div>
  )
}
