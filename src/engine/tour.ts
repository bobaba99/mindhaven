/**
 * First-run guided tour — teach-by-doing, one concept per step, skippable,
 * shown once. The state machine only ever moves FORWARD: each game event maps
 * to the furthest step it proves the player has mastered, so a player who
 * rushes ahead never gets stale instructions ("rush-proof").
 */
export type TourStep = 'walk' | 'approach' | 'enter' | 'earn' | 'done'
export type TourEvent = 'moved' | 'neared' | 'opened' | 'earned' | 'skip'

export interface TourState {
  step: TourStep
  completed: boolean
}

export const TOUR_STORAGE_KEY = 'mindhaven.tour.v1'

export const TOUR_STEPS: readonly TourStep[] = [
  'walk',
  'approach',
  'enter',
  'earn',
  'done',
]

/** The step each event proves the player has reached. */
const STEP_AFTER_EVENT: Record<TourEvent, TourStep> = {
  moved: 'approach',
  neared: 'enter',
  opened: 'earn',
  earned: 'done',
  skip: 'done',
}

export function stepIndex(step: TourStep): number {
  return TOUR_STEPS.indexOf(step)
}

export function initialTour(): TourState {
  return { step: 'walk', completed: false }
}

export function advanceTour(state: TourState, event: TourEvent): TourState {
  const target = STEP_AFTER_EVENT[event]
  if (stepIndex(target) <= stepIndex(state.step)) return state
  return { step: target, completed: target === 'done' }
}

export function isTourDone(): boolean {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markTourDone(): void {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, '1')
  } catch {
    // storage unavailable — the tour will simply offer itself again
  }
}

const COPY: Record<Exclude<TourStep, 'done'>, { title: string; body: string }> = {
  walk: {
    title: 'Take a stroll',
    body: 'Walk with WASD or the arrow keys — on a phone, hold the on-screen pad.',
  },
  approach: {
    title: 'Find a door',
    body: 'Head toward a shop until a glowing prompt appears by its door.',
  },
  enter: {
    title: 'Step inside',
    body: 'Press E (or Enter, or tap ✦) to meet the psychologist who runs it.',
  },
  earn: {
    title: 'Bank some Insight',
    body: 'Open a lecture or try the Activity tab — banking ◆ Insight unlocks the shops further down Wundt Way.',
  },
}

export function stepCopy(step: Exclude<TourStep, 'done'>): { title: string; body: string } {
  return COPY[step]
}
