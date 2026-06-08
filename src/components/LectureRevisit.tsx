import { useEffect } from 'react'
import type { MiniLecture } from '../data/types'

interface LectureRevisitProps {
  lecture: MiniLecture
  onClose: () => void
}

/** Read-only revisit of a lecture opened from the Journal (no typewriter). */
export function LectureRevisit({ lecture, onClose }: LectureRevisitProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay overlay--top" role="dialog" aria-modal="true" aria-label={lecture.title}>
      <div className="revisit pixel-panel">
        <h3 className="lecture-panel__title">{lecture.title}</h3>
        <p className="lecture-panel__body">{lecture.blurb}</p>
        <button className="pixel-btn pixel-btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
