import { useState } from 'react'
import {
  CONDITIONING_THRESHOLD,
  chimeAlone,
  initialWatson,
  isConditioned,
  pairStimuli,
  type WatsonState,
} from '../../engine/minigames/watson'

interface WatsonGameProps {
  onSuccess: () => void
}

const ANIMALS = ['🐇', '🐕', '🕊️'] as const

/** Watson: ethically re-done stimulus pairing — condition CALM, never fear. */
export function WatsonGame({ onSuccess }: WatsonGameProps) {
  const [state, setState] = useState<WatsonState>(() => initialWatson())
  const [log, setLog] = useState(
    'The animals eye the chime warily. It means nothing to them — yet.',
  )
  const [soothed, setSoothed] = useState(false)

  const conditioned = isConditioned(state)

  const pair = () => {
    const next = pairStimuli(state)
    setState(next)
    setLog(
      isConditioned(next)
        ? 'Ding + 🥕 … ears perk before the treat even lands. The association has set.'
        : 'Ding + 🥕 … happy munching. The chime is starting to mean something good.',
    )
  }

  const chime = () => {
    const { state: next, response } = chimeAlone(state)
    setState(next)
    if (response === 'calm') {
      setLog('Ding — no treat at all, and every animal settles down, calm as dusk. Conditioned!')
      if (!soothed) {
        setSoothed(true)
        onSuccess()
      }
    } else {
      setLog('Ding — blank stares. A lone chime means nothing until it has been paired with something pleasant.')
    }
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        The kind re-do of 1920: pair a neutral chime with a treat until the
        chime <em>alone</em> soothes the pen. Conditioning works just as well
        teaching calm as it ever did teaching fear.
      </p>
      <div className="watson-pen" aria-hidden="true">
        {ANIMALS.map((a) => (
          <span key={a} className={`watson-animal${soothed ? ' watson-animal--calm' : ''}`}>
            {a}
          </span>
        ))}
        <span className="watson-mood">{soothed ? '😌' : conditioned ? '😊' : '🤨'}</span>
      </div>
      <div className="bell-meter">
        Chime → calm association: {state.association}/100
        {conditioned ? ' — conditioned!' : ` (needs ${CONDITIONING_THRESHOLD})`}
        <div className="bell-bar">
          <div className="bell-bar__fill" style={{ width: `${state.association}%` }} />
        </div>
      </div>
      <div className="bell-actions">
        <button className="pixel-btn pixel-btn--primary" onClick={pair}>
          🔔 + 🥕 Pair chime with treat
        </button>
        <button className="pixel-btn" onClick={chime}>
          🔔 Chime alone
        </button>
      </div>
      <p className="mg__log" role="status">
        {log}
      </p>
      <p className="watson-ethics">
        Little Albert was taught fear and never deconditioned — that study is
        why ethics boards exist. Here, the same learning principle teaches
        comfort instead. ({state.pairings} pairing{state.pairings === 1 ? '' : 's'},{' '}
        {state.calmResponses} calm response{state.calmResponses === 1 ? '' : 's'})
      </p>
    </div>
  )
}
