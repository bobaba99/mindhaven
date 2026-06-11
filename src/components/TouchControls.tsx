import type { MoveKey } from '../engine/input'

export interface TouchControlsHandle {
  press: (key: MoveKey) => void
  release: (key: MoveKey) => void
  interact: () => void
}

interface TouchControlsProps {
  controls: TouchControlsHandle
}

const DIRS: Array<{ key: MoveKey; glyph: string; cell: string }> = [
  { key: 'up', glyph: '▲', cell: 'touch-dpad__up' },
  { key: 'left', glyph: '◀', cell: 'touch-dpad__left' },
  { key: 'right', glyph: '▶', cell: 'touch-dpad__right' },
  { key: 'down', glyph: '▼', cell: 'touch-dpad__down' },
]

/**
 * On-screen D-pad + interact button for coarse-pointer (touch) devices.
 * Hidden entirely on mouse/trackpad setups via CSS. Press/release map onto
 * the same input controller the keyboard drives.
 */
export function TouchControls({ controls }: TouchControlsProps) {
  // Pointer capture pins the whole gesture to the button it started on, so
  // the matching release ALWAYS lands even if the finger slides away —
  // without it, touch D-pads are notorious for stuck directions.
  const hold = (key: MoveKey) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      controls.press(key)
      // Capture AFTER pressing, and guarded: a capture failure (stale or
      // synthetic pointer id) must never cost the player the input itself.
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        // uncapturable pointer — release safety comes from pointerup/cancel
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
      } catch {
        // already released — fine
      }
      controls.release(key)
    },
    onPointerCancel: () => controls.release(key),
    onLostPointerCapture: () => controls.release(key),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  })

  return (
    <div className="touch-controls">
      <div className="touch-dpad" role="group" aria-label="Movement pad">
        {DIRS.map((d) => (
          <button
            key={d.key}
            className={`touch-btn ${d.cell}`}
            aria-label={`Walk ${d.key}`}
            {...hold(d.key)}
          >
            {d.glyph}
          </button>
        ))}
      </div>
      <button
        className="touch-btn touch-interact"
        aria-label="Interact"
        onPointerDown={(e) => {
          e.preventDefault()
          controls.interact()
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        ✦
      </button>
    </div>
  )
}
