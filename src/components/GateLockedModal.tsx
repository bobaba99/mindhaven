import { useRef } from 'react'
import { LANE_UNLOCK_COST } from '../engine/world'
import { useModalKeys } from '../hooks/useModalKeys'

interface GateLockedModalProps {
  insight: number
  onClose: () => void
}

/** Shown when the player inspects the Memory Lane gate below threshold. */
export function GateLockedModal({ insight, onClose }: GateLockedModalProps) {
  const needed = LANE_UNLOCK_COST - insight
  const panelRef = useRef<HTMLDivElement>(null)
  useModalKeys(panelRef, onClose)
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Memory Lane (locked)"
    >
      <div className="locked-modal pixel-panel" ref={panelRef}>
        <header className="locked-modal__head">
          <span className="gate-modal__arch" aria-hidden="true">
            🌿
          </span>
          <div>
            <h2>Memory Lane</h2>
            <p className="dialogue__sub">A side street, branching north</p>
          </div>
        </header>
        <div className="locked-modal__body">
          <p className="locked-modal__lock">🚧 The archway is barred.</p>
          <p>
            Beyond the hedge: Ebbinghaus's bakery, Bartlett's story stand, and
            Sperling's photo kiosk — the memory researchers' quarter. Bank{' '}
            <strong>{LANE_UNLOCK_COST} ◆ Insight</strong> along Main Street and
            the bar lifts on its own.
          </p>
          <p className="locked-modal__progress">
            You have <strong>{insight} ◆</strong>. Need {needed} more.
          </p>
        </div>
        <footer className="locked-modal__foot">
          <button className="pixel-btn pixel-btn--primary" onClick={onClose}>
            Back to the street
          </button>
        </footer>
      </div>
    </div>
  )
}
