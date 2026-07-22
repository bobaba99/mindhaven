import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import {
  ANNA_FREUD_SUMMARY,
  buildDefenseRounds,
  isCorrectDefense,
} from '../../engine/quests/annafreud'

interface AnnaFreudQuestProps {
  onSuccess: () => void
}

/** Anna Freud: match fountain-side scenes to the defense mechanism at work. */
export function AnnaFreudQuest({ onSuccess }: AnnaFreudQuestProps) {
  const [rounds] = useState(() => buildDefenseRounds(shuffle))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [nCorrect, setNCorrect] = useState(0)
  const rewarded = useRef(false)

  const finished = idx >= rounds.length
  const round = finished ? null : rounds[idx]

  useEffect(() => {
    if (finished && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [finished, onSuccess])

  const choose = (mechanism: string) => {
    if (!round || picked) return
    setPicked(mechanism)
    if (isCorrectDefense(round.card.id, mechanism)) setNCorrect((n) => n + 1)
  }

  if (finished) {
    return (
      <div className="mg">
        <p className="mg__stat">🃏 Cards matched: {nCorrect}/{rounds.length}</p>
        <div className="kahneman-explain">
          <p>{ANNA_FREUD_SUMMARY}</p>
        </div>
      </div>
    )
  }

  const correct = picked !== null && isCorrectDefense(round!.card.id, picked)

  return (
    <div className="mg">
      <p className="mg__hint">
        Card {idx + 1} of {rounds.length}. Which defense is at work in this
        scene?
      </p>
      <p className="kahneman-q">🖼️ {round!.card.scenario}</p>
      <div className="kahneman-options">
        {round!.options.map((m) => {
          const state =
            picked === null
              ? ''
              : isCorrectDefense(round!.card.id, m)
                ? ' kahneman-opt--correct'
                : m === picked
                  ? ' kahneman-opt--wrong'
                  : ''
          return (
            <button
              key={m}
              className={`pixel-btn${state}`}
              onClick={() => choose(m)}
              disabled={picked !== null}
            >
              {m}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="kahneman-explain">
          <p>
            {correct
              ? '🪞 "Well seen — and seen kindly, I hope."'
              : `🪞 "Not quite — this one is ${round!.card.mechanism.toLowerCase()}."`}
          </p>
          <p>{round!.card.note}</p>
          <button
            className="pixel-btn pixel-btn--primary"
            onClick={() => {
              setPicked(null)
              setIdx((i) => i + 1)
            }}
          >
            {idx + 1 < rounds.length ? 'Next card' : 'Gather the cards'}
          </button>
        </div>
      )}
    </div>
  )
}
