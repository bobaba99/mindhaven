/**
 * Piaget's Schoolhouse — sort what a child is doing onto the developmental
 * stage where it belongs. Pure data + reducers.
 */
export type StageId = 'sensorimotor' | 'preoperational' | 'concrete' | 'formal'

export interface Stage {
  id: StageId
  name: string
  ages: string
  gist: string
}

export interface StageTask {
  id: string
  text: string
  stage: StageId
}

export interface PiagetState {
  /** taskId -> stage it was correctly placed on. */
  placed: Record<string, StageId>
  mistakes: number
}

export const STAGES: Stage[] = [
  {
    id: 'sensorimotor',
    name: 'Sensorimotor',
    ages: '0–2',
    gist: 'Knows the world through action; object permanence dawns.',
  },
  {
    id: 'preoperational',
    name: 'Preoperational',
    ages: '2–7',
    gist: 'Symbols and pretend play — but logic is shaky and looks rule.',
  },
  {
    id: 'concrete',
    name: 'Concrete Operational',
    ages: '7–11',
    gist: 'Solid logic about real, touchable things; conservation clicks.',
  },
  {
    id: 'formal',
    name: 'Formal Operational',
    ages: '12+',
    gist: 'Abstract, hypothetical, what-if reasoning.',
  },
]

export const TASKS: StageTask[] = [
  {
    id: 'rattle',
    text: 'Searches under the blanket for the rattle that just vanished',
    stage: 'sensorimotor',
  },
  {
    id: 'shake',
    text: 'Discovers that shaking the toy makes noise — and repeats it forever',
    stage: 'sensorimotor',
  },
  {
    id: 'juice',
    text: 'Insists the tall thin glass holds more juice after you pour it over',
    stage: 'preoperational',
  },
  {
    id: 'broom',
    text: 'Gallops a broom around the yard, announcing it is a horse',
    stage: 'preoperational',
  },
  {
    id: 'clay',
    text: 'Knows the flattened clay is still the same amount as the ball',
    stage: 'concrete',
  },
  {
    id: 'rocks',
    text: 'Sorts the rock collection by size, then re-sorts it by color',
    stage: 'concrete',
  },
  {
    id: 'tax',
    text: 'Debates what a fair tax would be in an imaginary kingdom',
    stage: 'formal',
  },
  {
    id: 'pendulum',
    text: 'Tests the pendulum by changing one variable at a time',
    stage: 'formal',
  },
]

export function initialPiaget(): PiagetState {
  return { placed: {}, mistakes: 0 }
}

export function classifyTask(taskId: string, stageId: StageId): boolean {
  const task = TASKS.find((t) => t.id === taskId)
  return task !== undefined && task.stage === stageId
}

export function placeTask(
  state: PiagetState,
  taskId: string,
  stageId: StageId,
): { state: PiagetState; correct: boolean } {
  if (taskId in state.placed) return { state, correct: true }
  if (classifyTask(taskId, stageId)) {
    return {
      state: { ...state, placed: { ...state.placed, [taskId]: stageId } },
      correct: true,
    }
  }
  return { state: { ...state, mistakes: state.mistakes + 1 }, correct: false }
}

export function isComplete(state: PiagetState): boolean {
  return TASKS.every((t) => t.id in state.placed)
}
