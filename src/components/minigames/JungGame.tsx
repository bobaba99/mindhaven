import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import {
  drawOpeningHand,
  isBalanced,
  motifFor,
  swapCard,
  type ArchetypeCard,
} from '../../engine/minigames/jung'

interface JungGameProps {
  onSuccess: () => void
}

/** Jung: swap archetype cards toward a hand that holds sun AND shadow. */
export function JungGame({ onSuccess }: JungGameProps) {
  const [hand, setHand] = useState<ArchetypeCard[]>(() => drawOpeningHand(shuffle))
  const [swaps, setSwaps] = useState(0)
  const fired = useRef(false)

  const motif = motifFor(hand)

  useEffect(() => {
    if (motif !== null && !fired.current) {
      fired.current = true
      onSuccess()
    }
  }, [motif, onSuccess])

  const swap = (card: ArchetypeCard) => {
    if (motif !== null) return
    setHand((h) => swapCard(h, card.id, shuffle))
    setSwaps((n) => n + 1)
  }

  const redraw = () => {
    setHand(drawOpeningHand(shuffle))
    setSwaps(0)
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        Draw from the collective deck. A whole hand needs <em>both</em> poles —
        at least two ☀️ sun cards and two 🌑 moon cards. Tap a card to trade it
        back into the deck.
      </p>
      <div className="jung-hand">
        {hand.map((card) => (
          <button
            key={card.id}
            className={`jung-card jung-card--${card.pole}`}
            onClick={() => swap(card)}
            disabled={motif !== null}
            aria-label={`${card.name} (${card.pole === 'sun' ? 'sun' : 'moon'} pole) — tap to swap`}
          >
            <span className="jung-card__pole" aria-hidden="true">
              {card.pole === 'sun' ? '☀️' : '🌑'}
            </span>
            <span className="jung-card__name">{card.name}</span>
            <span className="jung-card__line">{card.line}</span>
          </button>
        ))}
      </div>
      {motif === null ? (
        <p className="mg__log" role="status">
          {isBalanced(hand)
            ? ''
            : 'The hand leans too far to one pole. Jung would call that living half a life — swap a card.'}
          {swaps > 0 && ` (${swaps} swap${swaps === 1 ? '' : 's'})`}
        </p>
      ) : (
        <div className="kahneman-explain">
          <p>🔮 {motif}</p>
          <button className="pixel-btn" onClick={redraw}>
            Shuffle a new hand
          </button>
        </div>
      )}
    </div>
  )
}
