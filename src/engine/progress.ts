import { ALL_BUILDINGS, TOWNSFOLK } from '../data/buildings'

const STORAGE_KEY = 'mindhaven.progress.v1'

export interface ProgressState {
  /** Cumulative Insight score (never spent; gates are thresholds). */
  insight: number
  /** Lecture ids the player has completed. */
  completedLectures: string[]
  /** Building ids whose intro the player has read. */
  visitedBuildings: string[]
  /** Building ids unlocked once their Insight threshold was reached. */
  unlockedBuildings: string[]
  /** Townsfolk quest ids (= townsperson ids) the player has completed. */
  completedQuests: string[]
}

export const INSIGHT_PER_INTRO = 2
export const INSIGHT_PER_LECTURE = 3
export const INSIGHT_PER_QUEST = 5

// Valid id sets, so corrupt or tampered storage can't inject unknown ids.
const VALID_BUILDING_IDS = new Set(ALL_BUILDINGS.map((b) => b.id))
const VALID_LECTURE_IDS = new Set(
  ALL_BUILDINGS.flatMap((b) => b.lectures.map((l) => l.id)),
)
const VALID_QUEST_IDS = new Set(TOWNSFOLK.map((t) => t.id))

/** Keep only the string members of `value` that pass `valid`, de-duplicated. */
function sanitizeIds(value: unknown, valid: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item === 'string' && valid.has(item)) seen.add(item)
  }
  return [...seen]
}

/** Coerce a stored value to a finite, non-negative insight number. */
function sanitizeInsight(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0
}

export function defaultProgress(): ProgressState {
  // Buildings with unlockCost 0 are open from the start.
  const free = ALL_BUILDINGS.filter((b) => b.unlockCost === 0).map((b) => b.id)
  return {
    insight: 0,
    completedLectures: [],
    visitedBuildings: [],
    unlockedBuildings: free,
    completedQuests: [],
  }
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultProgress()
    const obj = parsed as Record<string, unknown>
    const base = defaultProgress()
    return {
      insight: sanitizeInsight(obj.insight),
      completedLectures: sanitizeIds(obj.completedLectures, VALID_LECTURE_IDS),
      visitedBuildings: sanitizeIds(obj.visitedBuildings, VALID_BUILDING_IDS),
      // always keep the free buildings unlocked
      unlockedBuildings: [
        ...new Set([
          ...base.unlockedBuildings,
          ...sanitizeIds(obj.unlockedBuildings, VALID_BUILDING_IDS),
        ]),
      ],
      // pre-v1.3 saves have no quest field — treat as none completed
      completedQuests: sanitizeIds(obj.completedQuests, VALID_QUEST_IDS),
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
  return ALL_BUILDINGS.find((b) => b.id === buildingId)?.unlockCost ?? 0
}

/**
 * Whether the player has banked enough Insight to cross a building's unlock
 * threshold. Insight is a CUMULATIVE progress score, not a spendable currency:
 * unlocking a building does NOT deduct Insight — the player simply needs their
 * running total to reach the (escalating) gate. So this is a threshold check,
 * not an affordability/purchase check. `canAfford` is kept as a deprecated
 * alias for back-compat.
 */
export function meetsUnlockThreshold(state: ProgressState, buildingId: string): boolean {
  return state.insight >= unlockCostFor(buildingId)
}

/** @deprecated Misleading name — Insight is not spent. Use `meetsUnlockThreshold`. */
export const canAfford = meetsUnlockThreshold

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

export function markQuestComplete(
  state: ProgressState,
  questId: string,
): ProgressState {
  if (state.completedQuests.includes(questId)) return state
  return {
    ...state,
    completedQuests: [...state.completedQuests, questId],
    insight: state.insight + INSIGHT_PER_QUEST,
  }
}

/**
 * Unlock a building once its Insight threshold is met. Insight is NOT deducted:
 * it is a cumulative score, and gates escalate (6 → 72) so the player keeps
 * banking. Guarded so a building below threshold can never be force-unlocked.
 */
export function unlockBuilding(state: ProgressState, buildingId: string): ProgressState {
  if (state.unlockedBuildings.includes(buildingId)) return state
  if (!meetsUnlockThreshold(state, buildingId)) return state
  return {
    ...state,
    unlockedBuildings: [...state.unlockedBuildings, buildingId],
  }
}

/** Total lectures available across all buildings (for journal progress). */
export const TOTAL_LECTURES = ALL_BUILDINGS.reduce(
  (n, b) => n + b.lectures.length,
  0,
)
