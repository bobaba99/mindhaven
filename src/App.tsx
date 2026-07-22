import { useCallback, useEffect, useRef, useState } from 'react'
import { ALL_BUILDINGS, TOWNSFOLK } from './data/buildings'
import type { Building, MiniLecture, Townsperson } from './data/types'
import { GATE_TO_LANE, type Interactable } from './engine/proximity'
import { LANE_UNLOCK_COST, type District } from './engine/world'
import { isUnlocked, canAfford } from './engine/progress'
import {
  getVolume,
  isMuted,
  playSfx,
  setMuted,
  setVolume,
} from './engine/audio'
import {
  playStinger,
  startMusic,
  stopMusic,
  syncMusicVolume,
} from './engine/music'
import {
  cssVarsFor,
  loadSettings,
  saveSettings,
  type GameSettings,
} from './engine/settings'
import {
  advanceTour,
  initialTour,
  isTourDone,
  markTourDone,
  type TourEvent,
  type TourState,
} from './engine/tour'
import { useProgress } from './hooks/useProgress'
import { TownCanvas } from './components/TownCanvas'
import { TownsfolkPanel } from './components/TownsfolkPanel'
import { GateLockedModal } from './components/GateLockedModal'
import { HUD } from './components/HUD'
import { DialoguePanel } from './components/DialoguePanel'
import { LockedModal } from './components/LockedModal'
import { Journal } from './components/Journal'
import { LectureRevisit } from './components/LectureRevisit'
import { GazettePanel } from './components/GazettePanel'
import { SettingsPanel } from './components/SettingsPanel'
import { TitleScreen } from './components/TitleScreen'
import { TourToast } from './components/TourToast'
import './styles/ui.css'

const BUILDING_BY_ID = new Map(ALL_BUILDINGS.map((b) => [b.id, b]))
const FOLK_BY_ID = new Map(TOWNSFOLK.map((t) => [t.id, t]))
const INSIGHT_PER_HOOK = 4

type Overlay =
  | { kind: 'none' }
  | { kind: 'dialogue'; building: Building }
  | { kind: 'locked'; building: Building }
  | { kind: 'townsfolk'; person: Townsperson }
  | { kind: 'gate-locked' }
  | { kind: 'journal' }
  | { kind: 'revisit'; lecture: MiniLecture }
  | { kind: 'settings' }
  | { kind: 'gazette' }

export function App() {
  const [started, setStarted] = useState(false)
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' })
  const [district, setDistrict] = useState<District>('main')
  const [muted, setMutedState] = useState(() => isMuted())
  const [volume, setVolumeState] = useState(() => getVolume())
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings())
  const [tour, setTour] = useState<TourState>(() =>
    isTourDone() ? { step: 'done', completed: true } : initialTour(),
  )
  const { progress, readIntro, completeLecture, completeQuest, unlock, addInsight } =
    useProgress()

  // Track which buildings have already paid out their one-time hook Insight.
  const hookPaid = useRef<Set<string>>(new Set())

  const paused = overlay.kind !== 'none' || !started

  const unlockedIds = progress.unlockedBuildings

  const toggleMute = useCallback(() => {
    setMutedState((m) => {
      const next = !m
      setMuted(next)
      if (!next) playSfx('blip')
      return next
    })
  }, [])

  const updateSettings = useCallback((next: GameSettings) => {
    setSettings(next)
    saveSettings(next)
  }, [])

  const updateVolume = useCallback((v: number) => {
    setVolumeState(v)
    setVolume(v)
    syncMusicVolume()
  }, [])

  // The town theme runs while the game is on screen and unmuted. Starting on
  // the Start click satisfies the browsers' user-gesture autoplay rule. The
  // theme also yields when the tab is hidden — a backgrounded town shouldn't
  // keep humming into someone's meeting.
  useEffect(() => {
    const sync = () => {
      if (started && !muted && document.visibilityState === 'visible') {
        startMusic()
      } else {
        stopMusic()
      }
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      stopMusic()
    }
  }, [started, muted])

  // --- first-run tour ---
  const tourEvent = useCallback((event: TourEvent) => {
    setTour((t) => {
      const next = advanceTour(t, event)
      if (next !== t) {
        playSfx(next.completed ? 'chime' : 'blip')
        if (next.completed) markTourDone()
      }
      return next
    })
  }, [])

  // Step 1 (walk): any movement input — keyboard keys or the touch D-pad.
  useEffect(() => {
    if (!started || tour.step !== 'walk') return
    const MOVE_KEYS = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
    ])
    const onKey = (e: KeyboardEvent) => {
      if (MOVE_KEYS.has(e.key)) tourEvent('moved')
    }
    const onPointer = (e: PointerEvent) => {
      if ((e.target as HTMLElement | null)?.closest('.touch-dpad')) tourEvent('moved')
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [started, tour.step, tourEvent])

  // Step 4 (earn): the first lecture completed after the tour begins. (The
  // greeting's automatic +2 would finish this step before it could be read —
  // the step exists to point players at the Lectures/Activity tabs.)
  const tourBaseLectures = useRef(progress.completedLectures.length)
  useEffect(() => {
    if (!tour.completed && progress.completedLectures.length > tourBaseLectures.current) {
      tourEvent('earned')
    }
  }, [progress.completedLectures.length, tour.completed, tourEvent])

  const handleNearChange = useCallback(
    (target: Interactable | null) => {
      // the tour's "approach a door" step is about shop doors specifically
      if (target?.kind === 'building') tourEvent('neared')
    },
    [tourEvent],
  )

  const handleInteract = useCallback(
    (target: Interactable) => {
      if (target.kind === 'townsperson') {
        const person = FOLK_BY_ID.get(target.id)
        if (!person) return
        playSfx('blip')
        setOverlay({ kind: 'townsfolk', person })
        return
      }
      if (target.kind === 'gate') {
        if (target.id === GATE_TO_LANE) {
          if (progress.insight >= LANE_UNLOCK_COST) {
            playSfx('unlock')
            setDistrict('lane')
          } else {
            playSfx('locked')
            setOverlay({ kind: 'gate-locked' })
          }
        } else {
          playSfx('blip')
          setDistrict('main')
        }
        return
      }
      const building = BUILDING_BY_ID.get(target.id)
      if (!building) return
      if (isUnlocked(progress, target.id)) {
        playSfx('blip')
        playStinger(target.id)
        setOverlay({ kind: 'dialogue', building })
        tourEvent('opened')
      } else {
        playSfx('locked')
        setOverlay({ kind: 'locked', building })
      }
    },
    [progress, tourEvent],
  )

  const handleHookComplete = useCallback(
    (buildingId: string) => {
      if (hookPaid.current.has(buildingId)) return
      hookPaid.current.add(buildingId)
      addInsight(INSIGHT_PER_HOOK)
      playSfx('chime')
      tourEvent('earned')
    },
    [addInsight, tourEvent],
  )

  // Ref mirror so the callback stays stable and closure-proof while still
  // only chiming for genuinely new lectures.
  const completedRef = useRef(progress.completedLectures)
  completedRef.current = progress.completedLectures
  const handleLectureComplete = useCallback(
    (lectureId: string) => {
      if (!completedRef.current.includes(lectureId)) playSfx('insight')
      completeLecture(lectureId)
    },
    [completeLecture],
  )

  // Same pattern for townsfolk quests: chime only on first completion —
  // the reducer itself is idempotent, so replays never double-pay Insight.
  const questsRef = useRef(progress.completedQuests)
  questsRef.current = progress.completedQuests
  const handleQuestComplete = useCallback(
    (questId: string) => {
      if (!questsRef.current.includes(questId)) playSfx('chime')
      completeQuest(questId)
    },
    [completeQuest],
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
    <div className="app" style={cssVarsFor(settings) as React.CSSProperties}>
      <HUD
        insight={progress.insight}
        lecturesDone={lecturesDone}
        buildingsUnlocked={unlockedIds.length}
        totalBuildings={ALL_BUILDINGS.length}
        street={district === 'lane' ? 'Memory Lane' : 'Wundt Way'}
        muted={muted}
        onToggleMute={toggleMute}
        onOpenSettings={() => setOverlay({ kind: 'settings' })}
        onOpenGazette={() => setOverlay({ kind: 'gazette' })}
        onOpenJournal={() => setOverlay({ kind: 'journal' })}
      />

      <main className="app__stage">
        <TownCanvas
          unlockedIds={unlockedIds}
          district={district}
          gateOpen={progress.insight >= LANE_UNLOCK_COST}
          paused={paused}
          onInteract={handleInteract}
          onNearChange={handleNearChange}
        />
      </main>

      {/* The toast yields while any overlay is open — it must never sit on
          top of a modal and swallow its clicks (found via UI-drive testing). */}
      {started && !tour.completed && tour.step !== 'done' && overlay.kind === 'none' && (
        <TourToast step={tour.step} onSkip={() => tourEvent('skip')} />
      )}

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
          onLectureComplete={handleLectureComplete}
          onHookComplete={handleHookComplete}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'townsfolk' && (
        <TownsfolkPanel
          person={overlay.person}
          completedQuests={progress.completedQuests}
          onQuestComplete={handleQuestComplete}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'gate-locked' && (
        <GateLockedModal insight={progress.insight} onClose={closeOverlay} />
      )}

      {overlay.kind === 'locked' && (
        <LockedModal
          building={overlay.building}
          insight={progress.insight}
          canAfford={canAfford(progress, overlay.building.id)}
          onUnlock={() => {
            unlock(overlay.building.id)
            playSfx('unlock')
            setOverlay({ kind: 'dialogue', building: overlay.building })
          }}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'journal' && (
        <Journal
          completedLectures={progress.completedLectures}
          unlockedBuildings={unlockedIds}
          completedQuests={progress.completedQuests}
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

      {overlay.kind === 'settings' && (
        <SettingsPanel
          settings={settings}
          volume={volume}
          onChange={updateSettings}
          onVolumeChange={updateVolume}
          onClose={closeOverlay}
        />
      )}

      {overlay.kind === 'gazette' && <GazettePanel onClose={closeOverlay} />}
    </div>
  )
}
