import { useEffect, useMemo, useRef, useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import { playSfx } from '../../engine/audio'

interface MemoryGameProps {
  onSuccess: () => void
}

/** ms a mismatched pair stays face-up (mid-shake) before flipping back. */
const MISMATCH_FLIP_BACK_MS = 850

/** Calkins paired-associate pairs: a cue and its learned partner. */
const PAIRS: Array<[string, string]> = [
  ['Bell', 'Dinner'],
  ['Couch', 'Dream'],
  ['Lever', 'Reward'],
  ['Mall', 'Memory'],
]

interface Card {
  id: number
  pairId: number
  label: string
}

function buildDeck(): Card[] {
  const cards: Card[] = []
  PAIRS.forEach(([a, b], pairId) => {
    cards.push({ id: pairId * 2, pairId, label: a })
    cards.push({ id: pairId * 2 + 1, pairId, label: b })
  })
  return shuffle(cards)
}

/** Calkins: flip cards to match learned pairs (paired-associate memory). */
export function MemoryGame({ onSuccess }: MemoryGameProps) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck())
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [missed, setMissed] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const won = matched.size === deck.length
  const flipBackTimer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(flipBackTimer.current), [])

  const cluesMemo = useMemo(
    () => PAIRS.map(([a, b]) => `${a} → ${b}`).join('   ·   '),
    [],
  )

  const click = (idx: number) => {
    if (won || flipped.includes(idx) || matched.has(idx)) return
    if (flipped.length === 2) return

    playSfx('flip')
    const next = [...flipped, idx]
    setFlipped(next)
    if (next.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = next
      if (deck[a].pairId === deck[b].pairId) {
        const m2 = new Set(matched)
        m2.add(a)
        m2.add(b)
        setMatched(m2)
        setFlipped([])
        playSfx('match')
        if (m2.size === deck.length) onSuccess()
      } else {
        setMissed(next)
        playSfx('miss')
        flipBackTimer.current = window.setTimeout(() => {
          setFlipped([])
          setMissed([])
        }, MISMATCH_FLIP_BACK_MS)
      }
    }
  }

  const reset = () => {
    playSfx('flip')
    setDeck(buildDeck())
    setFlipped([])
    setMatched(new Set())
    setMissed([])
    setMoves(0)
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        Calkins' paired-associate task. Learn the pairs, then match each cue with
        its partner: <em>{cluesMemo}</em>
      </p>
      <div className="memory-grid">
        {deck.map((card, idx) => {
          const up = flipped.includes(idx) || matched.has(idx)
          const state = `${up ? ' memory-card--up' : ''}${
            matched.has(idx) ? ' memory-card--done' : ''
          }${missed.includes(idx) ? ' memory-card--miss' : ''}`
          return (
            <button
              key={card.id}
              className={`memory-card${state}`}
              onClick={() => click(idx)}
              disabled={won}
              aria-label={up ? card.label : 'Face-down card'}
            >
              <span className="memory-card__inner">
                <span className="memory-card__face memory-card__face--back" aria-hidden="true">
                  ?
                </span>
                <span className="memory-card__face memory-card__face--front">
                  {card.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mg__stat">
        Moves: {moves}
        {won && ' — all pairs recalled! Memory journal unlocked.'}
        {won && (
          <button className="pixel-btn" style={{ marginLeft: 10 }} onClick={reset}>
            Play again
          </button>
        )}
      </p>
    </div>
  )
}
