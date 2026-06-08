import { useEffect, useRef, useState } from 'react'
import {
  loadProgress,
  saveProgress,
  markVisited,
  markLectureComplete,
  unlockBuilding,
  type ProgressState,
} from '../engine/progress'

/**
 * React wrapper around the progress engine. Loads from localStorage on mount,
 * persists on every change, and exposes immutable action helpers.
 */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const firstRender = useRef(true)

  // persist after the initial load
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    saveProgress(progress)
  }, [progress])

  const readIntro = (buildingId: string) =>
    setProgress((p) => markVisited(p, buildingId))

  const completeLecture = (lectureId: string) =>
    setProgress((p) => markLectureComplete(p, lectureId))

  const unlock = (buildingId: string) =>
    setProgress((p) => unlockBuilding(p, buildingId))

  const addInsight = (amount: number) =>
    setProgress((p) => ({ ...p, insight: p.insight + amount }))

  const reset = () =>
    setProgress({
      insight: 0,
      completedLectures: [],
      visitedBuildings: [],
      unlockedBuildings: loadProgress().unlockedBuildings,
    })

  return {
    progress,
    readIntro,
    completeLecture,
    unlock,
    addInsight,
    reset,
  }
}
