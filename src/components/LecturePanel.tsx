import { playSfx } from '../engine/audio'
import { useTypewriter } from '../hooks/useTypewriter'
import type { MiniLecture } from '../data/types'

interface LecturePanelProps {
  lecture: MiniLecture
  completed: boolean
  onComplete: () => void
  onBack: () => void
}

/** A single mini-lecture: title + typewritten blurb + complete/back controls. */
export function LecturePanel({
  lecture,
  completed,
  onComplete,
  onBack,
}: LecturePanelProps) {
  const { shown, done, skip } = useTypewriter(lecture.blurb, 55, {
    onTick: () => playSfx('tick'),
  })

  return (
    <div className="lecture-panel">
      <button className="lecture-panel__back" onClick={onBack}>
        ← Back to {` `}lectures
      </button>
      <h3 className="lecture-panel__title">{lecture.title}</h3>
      <p className="lecture-panel__body" onClick={skip}>
        {shown}
        {!done && <span className="caret">▌</span>}
      </p>
      <div className="lecture-panel__actions">
        {!done && (
          <button className="pixel-btn" onClick={skip}>
            Skip ▸▸
          </button>
        )}
        {done && (
          <button
            className={`pixel-btn pixel-btn--primary${completed ? ' is-done' : ''}`}
            onClick={onComplete}
            disabled={completed}
          >
            {completed ? '✓ Completed (+0)' : 'Mark complete (+3 ◆)'}
          </button>
        )}
      </div>
    </div>
  )
}
