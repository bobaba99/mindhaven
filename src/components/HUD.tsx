import { TOTAL_LECTURES } from '../engine/progress'

interface HUDProps {
  insight: number
  lecturesDone: number
  buildingsUnlocked: number
  totalBuildings: number
  muted: boolean
  onToggleMute: () => void
  onOpenSettings: () => void
  onOpenJournal: () => void
}

/** Top bar: title, Insight currency, progress, sound toggle, Journal button. */
export function HUD({
  insight,
  lecturesDone,
  buildingsUnlocked,
  totalBuildings,
  muted,
  onToggleMute,
  onOpenSettings,
  onOpenJournal,
}: HUDProps) {
  return (
    <header className="hud">
      <div className="hud__brand">
        <span className="hud__title">Mindhaven</span>
        <span className="hud__street">· Wundt Way</span>
      </div>
      <div className="hud__stats">
        <span className="hud__insight" title="Insight currency">
          ◆ {insight} <small>Insight</small>
        </span>
        <span className="hud__chip">
          🏛 {buildingsUnlocked}/{totalBuildings}
        </span>
        <span className="hud__chip">
          📖 {lecturesDone}/{TOTAL_LECTURES}
        </span>
        <button
          className="pixel-btn hud__journal"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-pressed={muted}
          title={muted ? 'Sound: off' : 'Sound: on'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="pixel-btn hud__journal"
          onClick={onOpenSettings}
          aria-label="Open reading settings"
          title="Text size & weight"
        >
          ⚙
        </button>
        <button className="pixel-btn hud__journal" onClick={onOpenJournal}>
          Journal (J)
        </button>
      </div>
    </header>
  )
}
