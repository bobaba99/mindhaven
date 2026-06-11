import { useState } from 'react'
import {
  GUESTS,
  REGARD_TO_SUCCEED,
  explainFor,
  initialRogers,
  isWarmWelcome,
  respond,
  type ResponseKind,
} from '../../engine/minigames/rogers'

interface RogersGameProps {
  onSuccess: () => void
}

/** Rogers: greet inn guests with reflective, person-centered listening. */
export function RogersGame({ onSuccess }: RogersGameProps) {
  const [state, setState] = useState(() => initialRogers())
  const [lastKind, setLastKind] = useState<ResponseKind | null>(null)
  const [rewarded, setRewarded] = useState(false)

  const answeredCount = Object.keys(state.answered).length
  const guest = GUESTS.find((g) => !(g.id in state.answered)) ?? null
  const showingFeedback = lastKind !== null

  const choose = (guestId: string, optionId: string, kind: ResponseKind) => {
    if (showingFeedback) return
    const next = respond(state, guestId, optionId)
    setState(next)
    setLastKind(kind)
    if (isWarmWelcome(next) && !rewarded) {
      setRewarded(true)
      onSuccess()
    }
  }

  const reset = () => {
    setState(initialRogers())
    setLastKind(null)
  }

  const hearts = '🤝'.repeat(state.regard) + '·'.repeat(Math.max(0, REGARD_TO_SUCCEED - state.regard))

  if (!guest && !showingFeedback) {
    return (
      <div className="mg">
        <p className="mg__stat">
          {isWarmWelcome(state)
            ? `🏡 The guestbook glows — ${state.regard}/${GUESTS.length} guests felt truly heard. The inn is warm tonight.`
            : `The evening ends a little cold — only ${state.regard} guest${state.regard === 1 ? '' : 's'} felt heard.`}
        </p>
        <p className="mg__hint">
          Rogers' three conditions — empathy, unconditional positive regard,
          congruence — are not techniques to fix people. They are a climate in
          which people fix themselves.
        </p>
        {!isWarmWelcome(state) && (
          <button className="pixel-btn pixel-btn--primary" onClick={reset}>
            Greet the evening guests again
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        Guests confide as they sign the regard guestbook. Respond the
        person-centered way: reflect what you hear — don't steer, don't judge.
        Warmth meter: <span aria-label={`${state.regard} of ${REGARD_TO_SUCCEED}`}>{hearts}</span>
      </p>
      {guest && !showingFeedback && (
        <>
          <p className="kahneman-q">
            <strong>{guest.name}:</strong> {guest.statement}
          </p>
          <div className="kahneman-options kahneman-options--column">
            {guest.options.map((o) => (
              <button
                key={o.id}
                className="pixel-btn"
                onClick={() => choose(guest.id, o.id, o.kind)}
              >
                {o.text}
              </button>
            ))}
          </div>
        </>
      )}
      {showingFeedback && lastKind && (
        <div className="kahneman-explain">
          <p>
            {lastKind === 'reflective'
              ? '🤝 The guest exhales — someone finally heard them.'
              : lastKind === 'directive'
                ? '📋 The guest nods politely and changes the subject.'
                : '🥶 The guest closes up and studies their boots.'}
          </p>
          <p>{explainFor(lastKind)}</p>
          <button className="pixel-btn pixel-btn--primary" onClick={() => setLastKind(null)}>
            {answeredCount < GUESTS.length ? 'Next guest' : 'Close the guestbook'}
          </button>
        </div>
      )}
    </div>
  )
}
