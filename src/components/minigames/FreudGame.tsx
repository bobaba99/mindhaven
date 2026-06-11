import { useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import {
  buildFreudRounds,
  isCorrectInterpretation,
} from '../../engine/minigames/freud'

interface FreudGameProps {
  onSuccess: () => void
}

/** Freud: nap on the couch, then match manifest dreams to latent readings. */
export function FreudGame({ onSuccess }: FreudGameProps) {
  const [rounds] = useState(() => buildFreudRounds(shuffle))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [interpreted, setInterpreted] = useState(0)
  const [rewarded, setRewarded] = useState(false)

  const finished = idx >= rounds.length
  const round = finished ? null : rounds[idx]

  const choose = (option: string) => {
    if (!round || picked) return
    setPicked(option)
    if (isCorrectInterpretation(round.symbol.id, option)) {
      setInterpreted((n) => n + 1)
      if (!rewarded) {
        setRewarded(true)
        onSuccess()
      }
    }
  }

  const next = () => {
    setPicked(null)
    setIdx((i) => i + 1)
  }

  if (finished) {
    return (
      <div className="mg">
        <p className="mg__stat">
          🛋️ Session over — {interpreted}/{rounds.length} dreams read the way
          Freud would have read them.
        </p>
        <p className="mg__hint">
          A century later, dream-symbol dictionaries are read as <em>historical
          theory</em>, not clinical fact — Freud's ideas famously resist
          testing. But the deeper claim, that much of the mind works outside
          awareness, is the part that lasted.
        </p>
      </div>
    )
  }

  const correct = picked !== null && isCorrectInterpretation(round!.symbol.id, picked)

  return (
    <div className="mg">
      <p className="mg__hint">
        Dream {idx + 1} of {rounds.length}. The <em>manifest</em> content is
        what you remember; pick the <em>latent</em> wish Freud would find
        beneath it.
      </p>
      <p className="kahneman-q">
        <span className="freud-emoji" aria-hidden="true">
          {round!.symbol.emoji}
        </span>{' '}
        {round!.symbol.manifest}…
      </p>
      <div className="kahneman-options kahneman-options--column">
        {round!.options.map((o) => {
          const state =
            picked === null
              ? ''
              : isCorrectInterpretation(round!.symbol.id, o)
                ? ' kahneman-opt--correct'
                : o === picked
                  ? ' kahneman-opt--wrong'
                  : ''
          return (
            <button
              key={o}
              className={`pixel-btn${state}`}
              onClick={() => choose(o)}
              disabled={picked !== null}
            >
              {o}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="kahneman-explain">
          <p>
            {correct
              ? '🗝️ "Precisely. The censor disguised it, but you read the label."'
              : '🚬 "A tempting surface reading — but the dream-work hides wishes, not weather reports."'}
          </p>
          <p>
            Latent reading: <em>{round!.symbol.latent}.</em>
          </p>
          <button className="pixel-btn pixel-btn--primary" onClick={next}>
            {idx + 1 < rounds.length ? 'Next dream' : 'Wake up'}
          </button>
        </div>
      )}
    </div>
  )
}
