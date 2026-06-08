import { useEffect, useState } from 'react'
import { BUILDINGS, TOWNSFOLK } from '../data/buildings'
import type { MiniLecture } from '../data/types'

interface JournalProps {
  completedLectures: string[]
  unlockedBuildings: string[]
  onRevisit: (lecture: MiniLecture) => void
  onClose: () => void
}

/** Insight Journal: revisit unlocked lectures + meet the wandering townsfolk. */
export function Journal({
  completedLectures,
  unlockedBuildings,
  onRevisit,
  onClose,
}: JournalProps) {
  const [view, setView] = useState<'lectures' | 'folk'>('lectures')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'j' || e.key === 'J') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" role="dialog" aria-label="Insight Journal">
      <div className="journal pixel-panel">
        <header className="journal__head">
          <h2>Insight Journal</h2>
          <button className="dialogue__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <nav className="journal__tabs">
          <button
            className={view === 'lectures' ? 'is-active' : ''}
            onClick={() => setView('lectures')}
          >
            Lectures
          </button>
          <button
            className={view === 'folk' ? 'is-active' : ''}
            onClick={() => setView('folk')}
          >
            Townsfolk
          </button>
        </nav>

        <div className="journal__body">
          {view === 'lectures' &&
            BUILDINGS.map((b) => {
              const unlocked = unlockedBuildings.includes(b.id)
              return (
                <section key={b.id} className="journal__shop">
                  <h3 className={unlocked ? '' : 'is-locked'}>
                    {unlocked ? '' : '🔒 '}
                    {b.order}. {b.name}
                    <small> — {b.figure}</small>
                  </h3>
                  {unlocked ? (
                    <ul>
                      {b.lectures.map((l) => {
                        const done = completedLectures.includes(l.id)
                        return (
                          <li key={l.id}>
                            <button
                              className="journal__lecture"
                              onClick={() => onRevisit(l)}
                            >
                              <span>{done ? '✓' : '◆'}</span>
                              {l.title}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="journal__locked-note">
                      Bank {b.unlockCost} ◆ Insight to unlock these lectures.
                    </p>
                  )}
                </section>
              )
            })}

          {view === 'folk' && (
            <ul className="journal__folk">
              {TOWNSFOLK.map((t) => (
                <li key={t.id}>
                  <div className="journal__folk-dot" style={{ background: t.color }} />
                  <div>
                    <strong>
                      {t.name} <small>{t.dates}</small>
                    </strong>
                    <p className="journal__folk-line">“{t.blurb}”</p>
                    <p className="journal__folk-contrib">{t.contribution}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
