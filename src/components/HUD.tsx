import { TOTAL_LECTURES } from '../engine/progress'

interface HUDProps {
  insight: number
  lecturesDone: number
  buildingsUnlocked: number
  totalBuildings: number
  onOpenJournal: () => void
}

/** Top bar: title, Insight currency, progress, and the Journal button. */
export function HUD({
  insight,
  lecturesDone,
  buildingsUnlocked,
  totalBuildings,
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
        <button className="pixel-btn hud__journal" onClick={onOpenJournal}>
          Journal (J)
        </button>
      </div>
    </header>
  )
}
