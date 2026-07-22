import { useEffect, useRef, useState } from 'react'
import {
  ADLER_SUMMARY,
  BELONGING_ROUNDS,
  isConnectingChoice,
} from '../../engine/quests/adler'

interface AdlerQuestProps {
  onSuccess: () => void
}

/** Adler: pick the task that gives two lonely neighbors a way to contribute. */
export function AdlerQuest({ onSuccess }: AdlerQuestProps) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const rewarded = useRef(false)

  const finished = idx >= BELONGING_ROUNDS.length
  const round = finished ? null : BELONGING_ROUNDS[idx]

  useEffect(() => {
    if (finished && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [finished, onSuccess])

  if (finished) {
    return (
      <div className="mg">
        <p className="mg__stat">🤝 Both neighbors have somewhere to be.</p>
        <div className="kahneman-explain">
          <p>{ADLER_SUMMARY}</p>
        </div>
      </div>
    )
  }

  const connecting = picked !== null && isConnectingChoice(round!, picked)

  return (
    <div className="mg">
      <p className="mg__hint">
        Neighbors {idx + 1} of {BELONGING_ROUNDS.length}. Find the task that
        needs them <em>both</em>.
      </p>
      <p className="kahneman-q">{round!.personA}</p>
      <p className="kahneman-q">{round!.personB}</p>
      {picked === null ? (
        <div className="kahneman-options kahneman-options--column">
          {round!.options.map((o) => (
            <button key={o} className="pixel-btn" onClick={() => setPicked(o)}>
              {o}
            </button>
          ))}
        </div>
      ) : (
        <div className="kahneman-explain">
          <p>
            {connecting
              ? '🔗 "Yes — a task, not an introduction. Watch what belonging does to posture."'
              : '🪑 "Kind, but it leaves someone a spectator — or a charity case. Belonging needs a contribution."'}
          </p>
          <p>{round!.why}</p>
          <button
            className="pixel-btn pixel-btn--primary"
            onClick={() => {
              setPicked(null)
              setIdx((i) => i + 1)
            }}
          >
            {idx + 1 < BELONGING_ROUNDS.length ? 'Next neighbors' : 'Step back and watch'}
          </button>
        </div>
      )}
    </div>
  )
}
