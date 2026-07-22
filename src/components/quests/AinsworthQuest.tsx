import { useEffect, useRef, useState } from 'react'
import {
  ATTACHMENT_LABELS,
  REUNION_ROUNDS,
  scoreReunion,
  summarizeReunions,
  type AttachmentStyle,
} from '../../engine/quests/ainsworth'

interface AinsworthQuestProps {
  onSuccess: () => void
}

const STYLES: AttachmentStyle[] = ['secure', 'avoidant', 'resistant']

/** Ainsworth: classify three street reunions by attachment style. */
export function AinsworthQuest({ onSuccess }: AinsworthQuestProps) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<AttachmentStyle | null>(null)
  const [nCorrect, setNCorrect] = useState(0)
  const rewarded = useRef(false)

  const finished = idx >= REUNION_ROUNDS.length
  const round = finished ? null : REUNION_ROUNDS[idx]

  useEffect(() => {
    if (finished && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [finished, onSuccess])

  const choose = (style: AttachmentStyle) => {
    if (!round || picked) return
    setPicked(style)
    if (scoreReunion(round, style).correct) setNCorrect((n) => n + 1)
  }

  if (finished) {
    return (
      <div className="mg">
        <p className="mg__stat">🍼 Reunions read: {nCorrect}/{REUNION_ROUNDS.length}</p>
        <div className="kahneman-explain">
          <p>{summarizeReunions(nCorrect)}</p>
        </div>
      </div>
    )
  }

  const correct = picked !== null && scoreReunion(round!, picked).correct

  return (
    <div className="mg">
      <p className="mg__hint">
        Reunion {idx + 1} of {REUNION_ROUNDS.length}. Watch the moment of
        return — then name the pattern.
      </p>
      <p className="kahneman-q">{round!.vignette}</p>
      {picked === null ? (
        <div className="kahneman-options kahneman-options--column">
          {STYLES.map((s) => (
            <button key={s} className="pixel-btn" onClick={() => choose(s)}>
              {ATTACHMENT_LABELS[s]}
            </button>
          ))}
        </div>
      ) : (
        <div className="kahneman-explain">
          <p>
            {correct
              ? '📎 "Precisely what my coders would have marked."'
              : `🔍 "Look again at the reunion itself — this one is ${ATTACHMENT_LABELS[round!.correct].toLowerCase()}."`}
          </p>
          <p>{round!.read}</p>
          <button
            className="pixel-btn pixel-btn--primary"
            onClick={() => {
              setPicked(null)
              setIdx((i) => i + 1)
            }}
          >
            {idx + 1 < REUNION_ROUNDS.length ? 'Next reunion' : 'Compare notes'}
          </button>
        </div>
      )}
    </div>
  )
}
