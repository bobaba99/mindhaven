import { useEffect, useState } from 'react'
import type { Building } from '../data/types'
import { useTypewriter } from '../hooks/useTypewriter'
import { NpcAvatar } from './NpcAvatar'
import { LecturePanel } from './LecturePanel'
import { MinigameHost } from './minigames/MinigameHost'

type Tab = 'intro' | 'lectures' | 'hook'

interface DialoguePanelProps {
  building: Building
  completedLectures: string[]
  onLectureComplete: (lectureId: string) => void
  onHookComplete: (buildingId: string) => void
  /** Fired once when the intro is first opened (grants intro Insight). */
  onIntroRead: (buildingId: string) => void
  onClose: () => void
}

/**
 * The full NPC interaction for one building: in-character intro (typewriter),
 * a list of mini-lectures, and the interactive hook. Manages its own tab state.
 */
export function DialoguePanel({
  building,
  completedLectures,
  onLectureComplete,
  onHookComplete,
  onIntroRead,
  onClose,
}: DialoguePanelProps) {
  const [tab, setTab] = useState<Tab>('intro')
  const [openLecture, setOpenLecture] = useState<string | null>(null)
  const { shown, done, skip } = useTypewriter(building.intro, 50)

  // Grant intro Insight the first time this panel mounts for the building.
  useEffect(() => {
    onIntroRead(building.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building.id])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (openLecture) setOpenLecture(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openLecture, onClose])

  const lecture = building.lectures.find((l) => l.id === openLecture) ?? null
  const completedCount = building.lectures.filter((l) =>
    completedLectures.includes(l.id),
  ).length

  return (
    <div className="overlay" role="dialog" aria-label={`${building.figure} dialogue`}>
      <div className="dialogue pixel-panel">
        <header className="dialogue__head">
          <NpcAvatar name={building.figure} size={72} />
          <div className="dialogue__title">
            <h2>{building.name}</h2>
            <p className="dialogue__sub">
              {building.figure} · <span>{building.dates}</span> · {building.school}
            </p>
          </div>
          <button className="dialogue__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <nav className="dialogue__tabs">
          <button
            className={tab === 'intro' ? 'is-active' : ''}
            onClick={() => {
              setTab('intro')
              setOpenLecture(null)
            }}
          >
            Greeting
          </button>
          <button
            className={tab === 'lectures' ? 'is-active' : ''}
            onClick={() => setTab('lectures')}
          >
            Lectures ({completedCount}/{building.lectures.length})
          </button>
          <button
            className={tab === 'hook' ? 'is-active' : ''}
            onClick={() => {
              setTab('hook')
              setOpenLecture(null)
            }}
          >
            Activity
          </button>
        </nav>

        <div className="dialogue__body">
          {tab === 'intro' && (
            <div className="dialogue__intro" onClick={skip}>
              <p className="dialogue__speech">
                {shown}
                {!done && <span className="caret">▌</span>}
              </p>
              {done && (
                <button
                  className="pixel-btn pixel-btn--primary"
                  onClick={() => setTab('lectures')}
                >
                  Hear the lectures ▸
                </button>
              )}
            </div>
          )}

          {tab === 'lectures' &&
            (lecture ? (
              <LecturePanel
                lecture={lecture}
                completed={completedLectures.includes(lecture.id)}
                onComplete={() => onLectureComplete(lecture.id)}
                onBack={() => setOpenLecture(null)}
              />
            ) : (
              <ul className="lecture-list">
                {building.lectures.map((l) => {
                  const isDone = completedLectures.includes(l.id)
                  return (
                    <li key={l.id}>
                      <button
                        className="lecture-list__item"
                        onClick={() => setOpenLecture(l.id)}
                      >
                        <span className="lecture-list__mark">{isDone ? '✓' : '◆'}</span>
                        <span>{l.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ))}

          {tab === 'hook' && (
            <MinigameHost building={building} onHookComplete={onHookComplete} />
          )}
        </div>

        <footer className="dialogue__foot">
          <span className="dialogue__hint-text">{building.hookDescription}</span>
          <span className="dialogue__esc">Esc to leave</span>
        </footer>
      </div>
    </div>
  )
}
