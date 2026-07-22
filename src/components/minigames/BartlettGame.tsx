import { useEffect, useRef, useState } from 'react'
import {
  GENERATIONS,
  ORIGINAL_PASSAGE,
  scoreGeneration,
  summarizeBartlett,
} from '../../engine/minigames/bartlett'

interface BartlettGameProps {
  onSuccess: () => void
}

/** Bartlett: predict how "The War of the Ghosts" warps as it is retold. */
export function BartlettGame({ onSuccess }: BartlettGameProps) {
  const [read, setRead] = useState(false)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [nCorrect, setNCorrect] = useState(0)
  const rewarded = useRef(false)

  const finished = read && idx >= GENERATIONS.length
  const gen = finished || !read ? null : GENERATIONS[idx]

  useEffect(() => {
    if (finished && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [finished, onSuccess])

  if (!read) {
    return (
      <div className="mg">
        <p className="mg__hint">
          The original, as I gave it to my first Cambridge reteller in 1932 —
          a Native American tale, deliberately far from their world:
        </p>
        <blockquote className="bartlett-passage">{ORIGINAL_PASSAGE}</blockquote>
        <button
          className="pixel-btn pixel-btn--primary"
          onClick={() => setRead(true)}
        >
          Pass the story along ▸
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="mg">
        <p className="mg__stat">📜 Distortions predicted: {nCorrect}/{GENERATIONS.length}</p>
        <div className="kahneman-explain">
          <p>{summarizeBartlett(nCorrect)}</p>
        </div>
      </div>
    )
  }

  const correct = picked !== null && scoreGeneration(gen!, picked).correct

  return (
    <div className="mg">
      <p className="mg__hint">
        Retelling {idx + 1} of {GENERATIONS.length}. The next teller never saw
        the page. What happens to this detail?
      </p>
      <p className="kahneman-q">{gen!.detail}</p>
      {picked === null ? (
        <div className="kahneman-options kahneman-options--column">
          {gen!.options.map((o) => (
            <button
              key={o.text}
              className="pixel-btn"
              onClick={() => {
                setPicked(o.text)
                if (scoreGeneration(gen!, o.text).correct) setNCorrect((n) => n + 1)
              }}
            >
              {o.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="kahneman-explain">
          <p>
            {correct
              ? `📜 "Just so — ${gen!.term.toLowerCase()}, as my retellers did without ever noticing."`
              : `🫖 "A reasonable guess, but memory is neither a photocopier nor a dice cup. This is ${gen!.term.toLowerCase()}."`}
          </p>
          <p>{gen!.why}</p>
          <button
            className="pixel-btn pixel-btn--primary"
            onClick={() => {
              setPicked(null)
              setIdx((i) => i + 1)
            }}
          >
            {idx + 1 < GENERATIONS.length ? 'Next retelling' : 'Compare to the original'}
          </button>
        </div>
      )}
    </div>
  )
}
