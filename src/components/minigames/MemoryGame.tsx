import { useMemo, useState } from 'react'

interface MemoryGameProps {
  onSuccess: () => void
}

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
  const [moves, setMoves] = useState(0)
  const won = matched.size === deck.length

  const cluesMemo = useMemo(
    () => PAIRS.map(([a, b]) => `${a} → ${b}`).join('   ·   '),
    [],
  )

  const click = (idx: number) => {
    if (won || flipped.includes(idx) || matched.has(idx)) return
    if (flipped.length === 2) return

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
        if (m2.size === deck.length) onSuccess()
      } else {
        window.setTimeout(() => setFlipped([]), 700)
      }
    }
  }

  const reset = () => {
    setDeck(buildDeck())
    setFlipped([])
    setMatched(new Set())
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
          const show = flipped.includes(idx) || matched.has(idx)
          return (
            <button
              key={card.id}
              className={`memory-card${show ? ' memory-card--up' : ''}${
                matched.has(idx) ? ' memory-card--done' : ''
              }`}
              onClick={() => click(idx)}
              disabled={won}
            >
              {show ? card.label : '?'}
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
