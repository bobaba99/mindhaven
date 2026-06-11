import { useEffect, useRef, useState } from 'react'
import {
  QUESTIONS,
  SCENE_FACTS,
  countPlanted,
  memorySummary,
} from '../../engine/minigames/loftus'

interface LoftusGameProps {
  onSuccess: () => void
}

/** Seconds the witnessed scene stays visible before the interview. */
const STUDY_SECONDS = 8

const SCENE_STRIP = '⛲ 🛒💙 🥖🧑‍🍳 🐕💤 ➡️🚸'

type Phase = 'brief' | 'study' | 'interview' | 'debrief'

/** Loftus: witness a scene, then survive a (gently) leading interview. */
export function LoftusGame({ onSuccess }: LoftusGameProps) {
  const [phase, setPhase] = useState<Phase>('brief')
  const [secondsLeft, setSecondsLeft] = useState(STUDY_SECONDS)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const timer = useRef<number>(0)
  const rewarded = useRef(false)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const beginStudy = () => {
    setPhase('study')
    setSecondsLeft(STUDY_SECONDS)
    timer.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer.current)
          setPhase('interview')
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const answer = (optionId: string) => {
    const q = QUESTIONS[qIdx]
    const nextAnswers = { ...answers, [q.id]: optionId }
    setAnswers(nextAnswers)
    if (qIdx + 1 < QUESTIONS.length) {
      setQIdx(qIdx + 1)
    } else {
      setPhase('debrief')
      if (!rewarded.current) {
        rewarded.current = true
        onSuccess()
      }
    }
  }

  if (phase === 'brief') {
    return (
      <div className="mg">
        <p className="mg__hint">
          You're about to witness a brief street scene. Watch closely — there
          will be questions. (There are <em>always</em> questions.)
        </p>
        <button className="pixel-btn pixel-btn--primary" onClick={beginStudy}>
          📷 Witness the scene
        </button>
      </div>
    )
  }

  if (phase === 'study') {
    return (
      <div className="mg">
        <div className="loftus-photo">
          <p className="loftus-photo__strip" aria-hidden="true">
            {SCENE_STRIP}
          </p>
          <ul className="loftus-photo__facts">
            {SCENE_FACTS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <p className="mg__stat" role="status">
          Developing in {secondsLeft}s…
        </p>
      </div>
    )
  }

  if (phase === 'interview') {
    const q = QUESTIONS[qIdx]
    return (
      <div className="mg">
        <p className="mg__hint">
          Interview {qIdx + 1} of {QUESTIONS.length} — answer from memory. No
          peeking; that's the point.
        </p>
        <p className="kahneman-q">🎙️ {q.prompt}</p>
        <div className="kahneman-options kahneman-options--column">
          {q.options.map((o) => (
            <button key={o.id} className="pixel-btn" onClick={() => answer(o.id)}>
              {o.text}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const planted = countPlanted(answers)
  return (
    <div className="mg">
      <p className="mg__stat">🖼️ Your developed photo, against the negatives:</p>
      <div className="kahneman-explain">
        {QUESTIONS.map((q) => {
          const chose = answers[q.id]
          const wasPlanted = q.plantedIds.includes(chose)
          const wasRight = q.correctId !== null && q.correctId === chose
          const misremembered = !wasPlanted && !wasRight && q.correctId !== null
          return (
            <p key={q.id}>
              {wasPlanted ? '🪲' : wasRight ? '✅' : misremembered ? '❌' : '➖'}{' '}
              <strong>{q.leading ? 'Leading: ' : ''}</strong>
              {q.reveal}
              {misremembered && ' (You simply misremembered this one — honest noise, no planting needed.)'}
            </p>
          )
        })}
        <p>
          <strong>{memorySummary(planted)}</strong>
        </p>
      </div>
    </div>
  )
}
