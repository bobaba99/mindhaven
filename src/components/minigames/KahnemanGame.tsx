import { useState } from 'react'

interface KahnemanGameProps {
  onSuccess: () => void
}

interface Question {
  prompt: string
  /** The tempting fast (System 1) answer. */
  fast: string
  /** The correct deliberate (System 2) answer. */
  slow: string
  /** Why System 1 misfires. */
  explain: string
}

const QUESTIONS: Question[] = [
  {
    prompt:
      'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
    fast: '10 cents',
    slow: '5 cents',
    explain:
      'System 1 blurts "10 cents." But if the ball were $0.10, the bat ($1.10) would be only $1.00 more total — wrong. The ball is $0.05, the bat $1.05.',
  },
  {
    prompt:
      'If it takes 5 machines 5 minutes to make 5 widgets, how long for 100 machines to make 100 widgets?',
    fast: '100 minutes',
    slow: '5 minutes',
    explain:
      'Each machine makes one widget in 5 minutes. 100 machines work in parallel, so 100 widgets still take just 5 minutes.',
  },
  {
    prompt:
      'Linda is outspoken and concerned with justice. Which is more probable: (A) Linda is a bank teller, or (B) Linda is a bank teller AND a feminist?',
    fast: '(B) teller and feminist',
    slow: '(A) bank teller',
    explain:
      'The conjunction fallacy: a combination can never be more probable than one of its parts. "Teller" includes all feminist tellers, so (A) is at least as likely.',
  },
]

/** Kahneman: snap fast (and fall for the bias), then check the slow answer. */
export function KahnemanGame({ onSuccess }: KahnemanGameProps) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<'fast' | 'slow' | null>(null)
  const q = QUESTIONS[idx]

  const choose = (which: 'fast' | 'slow') => {
    if (picked) return
    setPicked(which)
    onSuccess()
  }

  const next = () => {
    setPicked(null)
    setIdx((i) => (i + 1) % QUESTIONS.length)
  }

  // Randomize button order so the "fast" answer isn't always first.
  const fastFirst = (idx + q.prompt.length) % 2 === 0
  const options: Array<{ kind: 'fast' | 'slow'; text: string }> = fastFirst
    ? [
        { kind: 'fast', text: q.fast },
        { kind: 'slow', text: q.slow },
      ]
    : [
        { kind: 'slow', text: q.slow },
        { kind: 'fast', text: q.fast },
      ]

  return (
    <div className="mg">
      <p className="mg__hint">
        Fast counter vs. slow booth. Answer on instinct first — then see whether
        System 1 led you astray.
      </p>
      <p className="kahneman-q">{q.prompt}</p>
      <div className="kahneman-options">
        {options.map((o) => {
          const state =
            picked === null
              ? ''
              : o.kind === 'slow'
                ? ' kahneman-opt--correct'
                : picked === 'fast' && o.kind === 'fast'
                  ? ' kahneman-opt--wrong'
                  : ''
          return (
            <button
              key={o.kind}
              className={`pixel-btn${state}`}
              onClick={() => choose(o.kind)}
              disabled={picked !== null}
            >
              {o.text}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="kahneman-explain">
          <p>
            {picked === 'fast'
              ? '🏃 System 1 took the bait.'
              : '🧠 System 2 caught it — nice deliberation.'}
          </p>
          <p>{q.explain}</p>
          <button className="pixel-btn pixel-btn--primary" onClick={next}>
            Next puzzle
          </button>
        </div>
      )}
    </div>
  )
}
