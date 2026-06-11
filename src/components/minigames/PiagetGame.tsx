import { useState } from 'react'
import { shuffle } from '../../engine/shuffle'
import {
  STAGES,
  TASKS,
  initialPiaget,
  isComplete,
  placeTask,
  type StageId,
  type StageTask,
} from '../../engine/minigames/piaget'

interface PiagetGameProps {
  onSuccess: () => void
}

/** Piaget: sort what each child is doing onto its developmental stage. */
export function PiagetGame({ onSuccess }: PiagetGameProps) {
  const [order] = useState<StageTask[]>(() => shuffle(TASKS))
  const [state, setState] = useState(() => initialPiaget())
  const [wrongStage, setWrongStage] = useState<StageId | null>(null)
  const [rewarded, setRewarded] = useState(false)

  const task = order.find((t) => !(t.id in state.placed)) ?? null
  const placedCount = Object.keys(state.placed).length

  const place = (stageId: StageId) => {
    if (!task) return
    const { state: next, correct } = placeTask(state, task.id, stageId)
    setState(next)
    setWrongStage(correct ? null : stageId)
    if (isComplete(next) && !rewarded) {
      setRewarded(true)
      onSuccess()
    }
  }

  if (!task) {
    return (
      <div className="mg">
        <p className="mg__stat">
          🏫 Class dismissed — all {TASKS.length} children sorted
          {state.mistakes === 0
            ? ' without a single slip. Formal operational thinking indeed!'
            : ` (${state.mistakes} mix-up${state.mistakes === 1 ? '' : 's'} along the way).`}
        </p>
        <p className="mg__hint">
          Piaget's stages are a map, not a staircase with locked doors — ages
          blur and abilities overlap. The lasting insight: children are not
          tiny adults, and errors reveal the logic of the stage they're in.
        </p>
      </div>
    )
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        Child {placedCount + 1} of {TASKS.length} — which stage of thinking is
        this? {state.mistakes > 0 && `(mix-ups so far: ${state.mistakes})`}
      </p>
      <p className="kahneman-q">👧 {task.text}.</p>
      <div className="piaget-stages">
        {STAGES.map((s) => (
          <button
            key={s.id}
            className={`pixel-btn piaget-stage${wrongStage === s.id ? ' kahneman-opt--wrong' : ''}`}
            onClick={() => place(s.id)}
          >
            <strong>{s.name}</strong>
            <span className="piaget-stage__ages">ages {s.ages}</span>
          </button>
        ))}
      </div>
      {wrongStage !== null && (
        <p className="mg__log" role="status">
          Not quite — {STAGES.find((s) => s.id === wrongStage)?.name} is:{' '}
          {STAGES.find((s) => s.id === wrongStage)?.gist}
        </p>
      )}
    </div>
  )
}
