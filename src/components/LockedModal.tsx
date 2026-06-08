import { useRef } from 'react'
import type { Building } from '../data/types'
import { NpcAvatar } from './NpcAvatar'
import { useModalKeys } from '../hooks/useModalKeys'

interface LockedModalProps {
  building: Building
  insight: number
  canAfford: boolean
  onUnlock: () => void
  onClose: () => void
}

/** Shown when the player inspects a still-locked building. */
export function LockedModal({
  building,
  insight,
  canAfford,
  onUnlock,
  onClose,
}: LockedModalProps) {
  const needed = building.unlockCost - insight
  const panelRef = useRef<HTMLDivElement>(null)
  useModalKeys(panelRef, onClose)
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={`${building.name} (locked)`}>
      <div className="locked-modal pixel-panel" ref={panelRef}>
        <header className="locked-modal__head">
          <NpcAvatar name={building.figure} size={56} />
          <div>
            <h2>{building.name}</h2>
            <p className="dialogue__sub">
              {building.figure} · {building.dates}
            </p>
          </div>
        </header>
        <div className="locked-modal__body">
          <p className="locked-modal__lock">🔒 This shop is still shuttered.</p>
          <p>
            Wundt Way unlocks roughly chronologically. Bank{' '}
            <strong>{building.unlockCost} ◆ Insight</strong> by reading intros and
            completing lectures at earlier shops, then return to open it.
          </p>
          <p className="locked-modal__progress">
            You have <strong>{insight} ◆</strong>.{' '}
            {canAfford
              ? 'You have enough — open it now!'
              : `Need ${needed} more.`}
          </p>
        </div>
        <footer className="locked-modal__foot">
          <button
            className="pixel-btn pixel-btn--primary"
            onClick={onUnlock}
            disabled={!canAfford}
          >
            {canAfford ? `Unlock (${building.unlockCost} ◆ banked)` : 'Locked'}
          </button>
          <button className="pixel-btn" onClick={onClose}>
            Leave
          </button>
        </footer>
      </div>
    </div>
  )
}
