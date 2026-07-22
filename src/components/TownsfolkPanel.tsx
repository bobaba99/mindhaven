import { useEffect, useRef, useState } from 'react'
import type { Townsperson } from '../data/types'
import { questFor } from '../engine/quests/quests'
import { useTypewriter } from '../hooks/useTypewriter'
import { playSfx } from '../engine/audio'
import { NpcAvatar } from './NpcAvatar'
import { QuestHost } from './quests/QuestHost'

type Tab = 'greeting' | 'quest'

interface TownsfolkPanelProps {
  person: Townsperson
  completedQuests: string[]
  onQuestComplete: (townspersonId: string) => void
  onClose: () => void
}

/**
 * The street conversation with a wandering townsperson: an in-character
 * greeting (typewritten, like the shop intros) and their teach-by-doing
 * micro-quest. Mirrors DialoguePanel's structure and key handling.
 */
export function TownsfolkPanel({
  person,
  completedQuests,
  onQuestComplete,
  onClose,
}: TownsfolkPanelProps) {
  const quest = questFor(person.id)
  const [tab, setTab] = useState<Tab>('greeting')
  const { shown, done, skip } = useTypewriter(quest?.greeting ?? person.blurb, 50, {
    onTick: () => playSfx('tick'),
  })
  const panelRef = useRef<HTMLDivElement>(null)
  const questDone = completedQuests.includes(person.id)

  // Close on Escape; trap Tab inside the panel (same manners as the shops).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const node = panelRef.current
        if (!node) return
        const items = Array.from(
          node.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        )
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${person.name} conversation`}
    >
      <div className="dialogue pixel-panel" ref={panelRef}>
        <header className="dialogue__head">
          <NpcAvatar name={person.name} size={72} />
          <div className="dialogue__title">
            <h2>{person.name}</h2>
            <p className="dialogue__sub">
              Wanderer · <span>{person.dates}</span> · {person.contribution}
            </p>
          </div>
          <button className="dialogue__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <nav className="dialogue__tabs">
          <button
            className={tab === 'greeting' ? 'is-active' : ''}
            onClick={() => setTab('greeting')}
          >
            Greeting
          </button>
          <button
            className={tab === 'quest' ? 'is-active' : ''}
            onClick={() => setTab('quest')}
          >
            {quest ? quest.title : 'Errand'}
            {questDone ? ' ✓' : ''}
          </button>
        </nav>

        <div className="dialogue__body">
          <div className="tab-fade" key={tab}>
            {tab === 'greeting' && (
              <div
                className="dialogue__intro"
                onClick={done ? undefined : skip}
                onKeyDown={(e) => {
                  if (!done && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    skip()
                  }
                }}
                role={done ? undefined : 'button'}
                tabIndex={done ? undefined : 0}
                aria-label={done ? undefined : 'Skip the typewriter animation'}
              >
                <p className="dialogue__speech">
                  {shown}
                  {!done && <span className="caret">▌</span>}
                </p>
                {done && (
                  <button
                    className="pixel-btn pixel-btn--primary"
                    onClick={() => setTab('quest')}
                  >
                    {questDone ? 'Revisit the errand ▸' : 'Lend a hand ▸'}
                  </button>
                )}
              </div>
            )}

            {tab === 'quest' && (
              <QuestHost
                townspersonId={person.id}
                onQuestComplete={onQuestComplete}
              />
            )}
          </div>
        </div>

        <footer className="dialogue__foot">
          <span className="dialogue__hint-text">
            {quest?.teaser ?? person.blurb}
          </span>
          <span className="dialogue__esc">Esc to leave</span>
        </footer>
      </div>
    </div>
  )
}
