import {
  TOUR_STEPS,
  stepCopy,
  stepIndex,
  type TourStep,
} from '../engine/tour'

interface TourToastProps {
  step: Exclude<TourStep, 'done'>
  onSkip: () => void
}

const TEACHING_STEPS = TOUR_STEPS.filter((s) => s !== 'done')

/**
 * First-run tour prompt: one concept at a time, advanced by the player's own
 * actions (never a "next" button), always skippable.
 */
export function TourToast({ step, onSkip }: TourToastProps) {
  const copy = stepCopy(step)
  return (
    <div className="tour-toast" role="status" aria-live="polite" key={step}>
      <div className="tour-toast__dots" aria-hidden="true">
        {TEACHING_STEPS.map((s) => (
          <span
            key={s}
            className={`tour-toast__dot${
              stepIndex(s) < stepIndex(step)
                ? ' tour-toast__dot--past'
                : s === step
                  ? ' tour-toast__dot--now'
                  : ''
            }`}
          />
        ))}
      </div>
      <div className="tour-toast__text">
        <strong>{copy.title}</strong>
        <span>{copy.body}</span>
      </div>
      <button className="tour-toast__skip" onClick={onSkip}>
        Skip tour
      </button>
    </div>
  )
}
