import { useRef, useState } from 'react'
import {
  DISSONANCE_LINES,
  scoreFlags,
  summarizeDissonance,
} from '../../engine/quests/festinger'

interface FestingerQuestProps {
  onSuccess: () => void
}

/** Festinger: flag every line of his market story that is repair, not report. */
export function FestingerQuest({ onSuccess }: FestingerQuestProps) {
  const [flagged, setFlagged] = useState<ReadonlySet<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const rewarded = useRef(false)

  const toggle = (id: string) => {
    if (submitted) return
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = () => {
    setSubmitted(true)
    if (!rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }

  const score = scoreFlags(flagged)

  return (
    <div className="mg">
      <p className="mg__hint">
        Leon narrates his plum purchase. Tap every line where he is{' '}
        <em>repairing</em> a belief rather than reporting a fact — then call it.
      </p>
      <ul className="festinger-lines">
        {DISSONANCE_LINES.map((l) => {
          const isFlagged = flagged.has(l.id)
          const revealed = submitted
            ? l.rationalization
              ? ' festinger-line--rat'
              : ' festinger-line--fact'
            : ''
          return (
            <li key={l.id}>
              <button
                className={`festinger-line${isFlagged ? ' is-flagged' : ''}${revealed}`}
                onClick={() => toggle(l.id)}
                disabled={submitted}
                aria-pressed={isFlagged}
              >
                <span className="festinger-line__mark" aria-hidden="true">
                  {isFlagged ? '🚩' : '·'}
                </span>
                “{l.text}”
              </button>
              {submitted && (
                <p className="festinger-line__tell">
                  {l.rationalization ? '🔧' : '✅'} {l.tell}
                </p>
              )}
            </li>
          )
        })}
      </ul>
      {!submitted ? (
        <button className="pixel-btn pixel-btn--primary" onClick={submit}>
          Call out the repairs ({flagged.size} flagged)
        </button>
      ) : (
        <div className="kahneman-explain">
          <p className="mg__stat">
            🚩 Hits {score.hits} · missed {score.misses} · false alarms{' '}
            {score.falseAlarms}
          </p>
          <p>{summarizeDissonance(score)}</p>
        </div>
      )}
    </div>
  )
}
