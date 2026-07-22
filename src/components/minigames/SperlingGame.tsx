import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import {
  GRID_SIZE,
  buildSperlingGrid,
  buildLetterBank,
  scoreSelection,
  summarizeSperling,
} from '../../engine/minigames/sperling'

interface SperlingGameProps {
  onSuccess: () => void
}

type Phase =
  | 'ready-whole'
  | 'flash-whole'
  | 'report-whole'
  | 'ready-partial'
  | 'flash-partial'
  | 'report-partial'
  | 'done'

/** How long the photo stays up — a generous 500ms (Sperling used ~50ms!). */
const FLASH_MS = 500

const ROW_NAMES = ['top', 'middle', 'bottom'] as const

/** Sperling: whole report vs cued partial report on a flashed letter grid. */
export function SperlingGame({ onSuccess }: SperlingGameProps) {
  const [phase, setPhase] = useState<Phase>('ready-whole')
  const [grid, setGrid] = useState(() => buildSperlingGrid(shuffle))
  const [bank, setBank] = useState<string[]>([])
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set())
  const [cueRow, setCueRow] = useState(0)
  const [wholeHits, setWholeHits] = useState(0)
  const rewarded = useRef(false)

  // The flash: show the grid briefly, then move to the report phase.
  useEffect(() => {
    if (phase !== 'flash-whole' && phase !== 'flash-partial') return
    const next: Phase = phase === 'flash-whole' ? 'report-whole' : 'report-partial'
    const timer = window.setTimeout(() => {
      setBank(buildLetterBank(grid, shuffle))
      setPhase(next)
    }, FLASH_MS)
    return () => window.clearTimeout(timer)
  }, [phase, grid])

  useEffect(() => {
    if (phase === 'done' && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [phase, onSuccess])

  const togglePick = (letter: string, max: number) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(letter)) next.delete(letter)
      else if (next.size < max) next.add(letter)
      return next
    })
  }

  const gridView = (
    <div className="sperling-grid" role="img" aria-label="A flashed grid of letters">
      {grid.map((row, r) => (
        <div className="sperling-grid__row" key={r}>
          {row.map((ch) => (
            <span className="sperling-grid__cell" key={ch}>
              {ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  )

  if (phase === 'ready-whole') {
    return (
      <div className="mg">
        <p className="mg__hint">
          First, the classic camera test: nine letters, one flash, and you
          report <em>everything</em> you can. (I used a twentieth of a second
          in 1960; the kiosk is feeling generous at half of one.)
        </p>
        <button
          className="pixel-btn pixel-btn--primary"
          onClick={() => setPhase('flash-whole')}
        >
          📸 Flash the photo
        </button>
      </div>
    )
  }

  if (phase === 'flash-whole' || phase === 'flash-partial') {
    return (
      <div className="mg">
        <p className="mg__hint">Look—!</p>
        {gridView}
      </div>
    )
  }

  if (phase === 'report-whole') {
    return (
      <div className="mg">
        <p className="mg__hint">
          Gone. Report every letter you saw — pick up to nine.
        </p>
        <div className="kahneman-options">
          {bank.map((ch) => (
            <button
              key={ch}
              className={`pixel-btn${picked.has(ch) ? ' kahneman-opt--correct' : ''}`}
              aria-pressed={picked.has(ch)}
              onClick={() => togglePick(ch, GRID_SIZE * GRID_SIZE)}
            >
              {ch}
            </button>
          ))}
        </div>
        <button
          className="pixel-btn pixel-btn--primary"
          disabled={picked.size === 0}
          onClick={() => {
            const hits = grid.flat().filter((ch) => picked.has(ch)).length
            setWholeHits(hits)
            setPicked(new Set())
            setGrid(buildSperlingGrid(shuffle))
            setCueRow(Math.floor(Math.random() * GRID_SIZE))
            setPhase('ready-partial')
          }}
        >
          Develop the report ({picked.size})
        </button>
      </div>
    )
  }

  if (phase === 'ready-partial') {
    return (
      <div className="mg">
        <p className="mg__hint">
          Now my trick: a fresh photo flashes, and only <em>after</em> it is
          gone, a bell names ONE row to report. You cannot rehearse what you
          don't know you'll need…
        </p>
        <button
          className="pixel-btn pixel-btn--primary"
          onClick={() => setPhase('flash-partial')}
        >
          📸 Flash the second photo
        </button>
      </div>
    )
  }

  if (phase === 'report-partial') {
    return (
      <div className="mg">
        <p className="mg__hint">
          🔔 The bell rings: report the <strong>{ROW_NAMES[cueRow]}</strong> row
          — three letters.
        </p>
        <div className="kahneman-options">
          {bank.map((ch) => (
            <button
              key={ch}
              className={`pixel-btn${picked.has(ch) ? ' kahneman-opt--correct' : ''}`}
              aria-pressed={picked.has(ch)}
              onClick={() => togglePick(ch, GRID_SIZE)}
            >
              {ch}
            </button>
          ))}
        </div>
        <button
          className="pixel-btn pixel-btn--primary"
          disabled={picked.size === 0}
          onClick={() => setPhase('done')}
        >
          Develop the row ({picked.size}/{GRID_SIZE})
        </button>
      </div>
    )
  }

  const partial = scoreSelection(grid[cueRow], picked)
  return (
    <div className="mg">
      <p className="mg__stat">
        📸 Whole report: {wholeHits}/9 · cued row: {partial.hits}/{GRID_SIZE}
      </p>
      <div className="kahneman-explain">
        <p>{summarizeSperling({ wholeHits, partialHits: partial.hits })}</p>
      </div>
    </div>
  )
}
