import { useEffect, useState } from 'react'
import { GazettePanel } from './GazettePanel'

interface TitleScreenProps {
  onStart: () => void
  hasProgress: boolean
}

const CONTROLS: Array<{ what: string; keys: string[]; note?: string }> = [
  { what: 'Move', keys: ['W A S D', '← ↑ ↓ →'] },
  { what: 'Interact', keys: ['E', 'Enter'], note: 'when a door prompt appears' },
  { what: 'Journal', keys: ['J'] },
  { what: 'Back / close', keys: ['Esc'] },
]

/** Cozy title card shown before entering the town. */
export function TitleScreen({ onStart, hasProgress }: TitleScreenProps) {
  const [readingGazette, setReadingGazette] = useState(false)

  // Enter / Space starts the game without needing to focus the button first
  // (suspended while the Gazette is open so it can use its own keys).
  useEffect(() => {
    if (readingGazette) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart, readingGazette])

  return (
    <div className="title-screen">
      <div className="title-screen__card pixel-panel">
        <h1 className="title-screen__name">Mindhaven</h1>
        <p className="title-screen__tag">A walkable history of psychology on Wundt Way</p>
        <p className="title-screen__blurb">
          Stroll Main Street west to east — from Wundt's 1879 lab through
          behaviorism, psychoanalysis, humanism, the cognitive turn, and
          (ethics-forward) social psychology. Every shop is run by a famous
          psychologist who greets you, teaches bite-size lectures, and hides a
          playful activity drawn from their real theory.
        </p>

        <dl className="title-controls only-fine-pointer" aria-label="Keyboard controls">
          {CONTROLS.map((c) => (
            <div className="title-controls__row" key={c.what}>
              <dt className="title-controls__what">{c.what}</dt>
              <dd className="title-controls__keys">
                {c.keys.map((k, i) => (
                  <span key={k}>
                    {i > 0 && <span className="title-controls__or"> or </span>}
                    <kbd>{k}</kbd>
                  </span>
                ))}
                {c.note && <span className="title-controls__note"> — {c.note}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <p className="title-controls__touch only-coarse-pointer">
          📱 On touch: walk with the on-screen pad, tap <kbd>✦</kbd> to enter a
          shop, and use the top bar for the journal.
        </p>

        {!hasProgress && (
          <p className="title-screen__tour-note">
            New in town? A 20-second guided tour starts the moment you step
            outside — skippable any time.
          </p>
        )}

        <div className="title-screen__actions">
          <button className="pixel-btn pixel-btn--primary title-screen__start" onClick={onStart}>
            {hasProgress ? 'Continue your stroll ▸' : 'Enter Mindhaven ▸'}
          </button>
          <button className="pixel-btn title-screen__gazette" onClick={() => setReadingGazette(true)}>
            📰 The Gazette
          </button>
        </div>
      </div>

      {readingGazette && <GazettePanel onClose={() => setReadingGazette(false)} />}
    </div>
  )
}
