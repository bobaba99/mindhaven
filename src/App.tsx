import { useCallback, useEffect, useRef, useState } from 'react'
import { BUILDINGS } from './data/buildings'
import type { Building, MiniLecture } from './data/types'
import { isUnlocked, canAfford } from './engine/progress'
import { useProgress } from './hooks/useProgress'
import { TownCanvas } from './components/TownCanvas'
import { HUD } from './components/HUD'
import { DialoguePanel } from './components/DialoguePanel'
import { LockedModal } from './components/LockedModal'
import { Journal } from './components/Journal'
import { LectureRevisit } from './components/LectureRevisit'
import { TitleScreen } from './components/TitleScreen'
import './styles/ui.css'

const BUILDING_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b]))
const INSIGHT_PER_HOOK = 4

type Overlay =
  | { kind: 'none' }
  | { kind: 'dialogue'; building: Building }
  | { kind: 'locked'; building: Building }
  | { kind: 'journal' }
  | { kind: 'revisit'; lecture: MiniLecture }

export function App() {
  const [started, setStarted] = useState(false)
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' })
  const { progress, readIntro, completeLecture, unlock, addInsight } = useProgress()

  // Track which buildings have already paid out their one-time hook Insight.
  const hookPaid = useRef<Set<string>>(new Set())

  const paused = overlay.kind !== 'none' || !started

  const unlockedIds = progress.unlockedBuildings

  const handleInteract = useCallback(
    (buildingId: string) => {
      const building = BUILDING_BY_ID.get(buildingId)
      if (!building) return
      if (isUnlocked(progress, buildingId)) {
        setOverlay({ kind: 'dialogue', building })
      } else {
        setOverlay({ kind: 'locked', building })
      }
    },
    [progress],
  )

  const handleHookComplete = useCallback(
    (buildingId: string) => {
      if (hookPaid.current.has(buildingId)) return
      hookPaid.current.add(buildingId)
      addInsight(INSIGHT_PER_HOOK)
    },
    [addInsight],
  )

  // Global J = journal (only when no blocking overlay is mid-flow).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) return
      if ((e.key === 'j' || e.key === 'J') && overlay.kind === 'none') {
        e.preventDefault()
        setOverlay({ kind: 'journal' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, overlay.kind])

  const closeOverlay = useCallback(() => setOverlay({ kind: 'none' }), [])

  const lecturesDone = progress.completedLectures.length

  return (
    <div className="app">
      <HUD
        insight={progress.insight}
        lecturesDone={lecturesDone}
        buildingsUnlocked={unlockedIds.length}
        totalBuildings={BUILDINGS.length}
        onOpenJournal={() => setOverlay({ kind: 'journal' })}
      />

      <main className="app__stage">
        <TownCanvas
          unlockedIds={unlockedIds}
          paused={paused}
          onInteract={handleInteract}
        />
      </main>

      {!started && (
        <TitleScreen
          hasProgress={progress.insight > 0 || lecturesDone > 0}
          onStart={() => setStarted(true)}
        />
      )}

      {overlay.kind === 'dialogue' && (
        <DialoguePanel
          building={overlay.building}
          completedLectures={progress.completedLectures}
          onIntroRead={readIntro}
          onLectureComplete={completeLecture}
          onHookComplete={handleHookComplete}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'locked' && (
        <LockedModal
          building={overlay.building}
          insight={progress.insight}
          canAfford={canAfford(progress, overlay.building.id)}
          onUnlock={() => {
            unlock(overlay.building.id)
            setOverlay({ kind: 'dialogue', building: overlay.building })
          }}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'journal' && (
        <Journal
          completedLectures={progress.completedLectures}
          unlockedBuildings={unlockedIds}
          onRevisit={(lecture) => setOverlay({ kind: 'revisit', lecture })}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'revisit' && (
        <LectureRevisit
          lecture={overlay.lecture}
          onClose={() => setOverlay({ kind: 'journal' })}
        />
      )}
    </div>
  )
}
