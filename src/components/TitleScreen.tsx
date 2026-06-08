import { useEffect } from 'react'

interface TitleScreenProps {
  onStart: () => void
  hasProgress: boolean
}

/** Cozy title card shown before entering the town. */
export function TitleScreen({ onStart, hasProgress }: TitleScreenProps) {
  // Enter / Space starts the game without needing to focus the button first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart])

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
        <div className="title-screen__controls">
          <span>
            <kbd>WASD</kbd>/<kbd>↑↓←→</kbd> walk
          </span>
          <span>
            <kbd>E</kbd>/<kbd>Enter</kbd> interact
          </span>
          <span>
            <kbd>J</kbd> journal
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
        </div>
        <button className="pixel-btn pixel-btn--primary title-screen__start" onClick={onStart}>
          {hasProgress ? 'Continue your stroll ▸' : 'Enter Mindhaven ▸'}
        </button>
      </div>
    </div>
  )
}
