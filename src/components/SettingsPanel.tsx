import { useRef } from 'react'
import { useModalKeys } from '../hooks/useModalKeys'
import type { GameSettings, TextSize, TextWeight } from '../engine/settings'

interface SettingsPanelProps {
  settings: GameSettings
  /** Master audio volume, 0..1 (music and effects alike). */
  volume: number
  onChange: (settings: GameSettings) => void
  onVolumeChange: (volume: number) => void
  onClose: () => void
}

const SIZES: Array<{ id: TextSize; label: string }> = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

const WEIGHTS: Array<{ id: TextWeight; label: string }> = [
  { id: 'regular', label: 'Regular' },
  { id: 'medium', label: 'Medium' },
  { id: 'bold', label: 'Bold' },
]

/** Reading + sound settings, with a live preview line. */
export function SettingsPanel({
  settings,
  volume,
  onChange,
  onVolumeChange,
  onClose,
}: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useModalKeys(panelRef, onClose)

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Game settings">
      <div className="pixel-panel settings-panel" ref={panelRef}>
        <h2>Settings</h2>

        <div className="settings-panel__group" role="group" aria-label="Sound volume">
          <span className="settings-panel__label">Volume</span>
          <div className="settings-panel__options settings-panel__options--slider">
            <input
              type="range"
              className="settings-panel__slider"
              min={0}
              max={100}
              step={5}
              value={Math.round(volume * 100)}
              aria-label="Music and effects volume"
              aria-valuetext={`${Math.round(volume * 100)} percent`}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            />
            <span className="settings-panel__slider-value" aria-hidden="true">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <p className="settings-panel__hint">
            Music and effects together — 🔊 in the top bar mutes everything.
          </p>
        </div>

        <div className="settings-panel__group" role="group" aria-label="Text size">
          <span className="settings-panel__label">Text size</span>
          <div className="settings-panel__options">
            {SIZES.map((s) => (
              <button
                key={s.id}
                className={`pixel-btn${settings.textSize === s.id ? ' pixel-btn--primary' : ''}`}
                aria-pressed={settings.textSize === s.id}
                onClick={() => onChange({ ...settings, textSize: s.id })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-panel__group" role="group" aria-label="Text weight">
          <span className="settings-panel__label">Text weight</span>
          <div className="settings-panel__options">
            {WEIGHTS.map((w) => (
              <button
                key={w.id}
                className={`pixel-btn${settings.textWeight === w.id ? ' pixel-btn--primary' : ''}`}
                aria-pressed={settings.textWeight === w.id}
                onClick={() => onChange({ ...settings, textWeight: w.id })}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <p className="settings-panel__preview dialogue__speech">
          Preview: In 1879, in Leipzig, the mind got its first laboratory — and
          reading this should feel comfortable.
        </p>

        <div className="settings-panel__foot">
          <button className="pixel-btn pixel-btn--primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
