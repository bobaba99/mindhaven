import { BUILDINGS } from '../data/buildings'

const STORAGE_KEY = 'mindhaven.progress.v1'

export interface ProgressState {
  insight: number
  /** Lecture ids the player has completed. */
  completedLectures: string[]
  /** Building ids whose intro the player has read. */
  visitedBuildings: string[]
  /** Building ids the player has manually unlocked (spent gating). */
  unlockedBuildings: string[]
}

export const INSIGHT_PER_INTRO = 2
export const INSIGHT_PER_LECTURE = 3

export function defaultProgress(): ProgressState {
  // Buildings with unlockCost 0 are open from the start.
  const free = BUILDINGS.filter((b) => b.unlockCost === 0).map((b) => b.id)
  return {
    insight: 0,
    completedLectures: [],
    visitedBuildings: [],
    unlockedBuildings: free,
  }
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    const base = defaultProgress()
    return {
      insight: typeof parsed.insight === 'number' ? parsed.insight : 0,
      completedLectures: Array.isArray(parsed.completedLectures)
        ? parsed.completedLectures
        : [],
      visitedBuildings: Array.isArray(parsed.visitedBuildings)
        ? parsed.visitedBuildings
        : [],
      // always keep the free buildings unlocked
      unlockedBuildings: Array.from(
        new Set([
          ...base.unlockedBuildings,
          ...(Array.isArray(parsed.unlockedBuildings) ? parsed.unlockedBuildings : []),
        ]),
      ),
    }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode etc.) — fail silently, game still runs
  }
}

export function isUnlocked(state: ProgressState, buildingId: string): boolean {
  return state.unlockedBuildings.includes(buildingId)
}

/** Insight needed to unlock a building, or 0 if already unlocked/free. */
export function unlockCostFor(buildingId: string): number {
  return BUILDINGS.find((b) => b.id === buildingId)?.unlockCost ?? 0
}

/** Whether the player has banked enough Insight to unlock a building. */
export function canAfford(state: ProgressState, buildingId: string): boolean {
  return state.insight >= unlockCostFor(buildingId)
}

// --- immutable reducers ---

export function markVisited(state: ProgressState, buildingId: string): ProgressState {
  if (state.visitedBuildings.includes(buildingId)) return state
  return {
    ...state,
    visitedBuildings: [...state.visitedBuildings, buildingId],
    insight: state.insight + INSIGHT_PER_INTRO,
  }
}

export function markLectureComplete(
  state: ProgressState,
  lectureId: string,
): ProgressState {
  if (state.completedLectures.includes(lectureId)) return state
  return {
    ...state,
    completedLectures: [...state.completedLectures, lectureId],
    insight: state.insight + INSIGHT_PER_LECTURE,
  }
}

export function unlockBuilding(state: ProgressState, buildingId: string): ProgressState {
  if (state.unlockedBuildings.includes(buildingId)) return state
  if (!canAfford(state, buildingId)) return state
  return {
    ...state,
    unlockedBuildings: [...state.unlockedBuildings, buildingId],
  }
}

/** Total lectures available across all buildings (for journal progress). */
export const TOTAL_LECTURES = BUILDINGS.reduce((n, b) => n + b.lectures.length, 0)
