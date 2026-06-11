export type MoveKey = 'up' | 'down' | 'left' | 'right'

export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

const KEY_MAP: Record<string, MoveKey> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

const INTERACT_KEYS = new Set(['e', 'E', 'Enter', ' '])

export interface InputController {
  state: InputState
  /** Programmatic press (touch D-pad). Ignored while disabled. */
  press: (key: MoveKey) => void
  /** Programmatic release. Always lands, so touch keys can never stick. */
  release: (key: MoveKey) => void
  /** Programmatic interact (touch button). Respects the enabled gate. */
  interact: () => void
  dispose: () => void
}

/**
 * Input controller for keyboard AND programmatic (touch) sources. Tracks held
 * movement keys and fires a callback on interact. Returns a disposer.
 * `enabled` lets callers freeze movement while an overlay is open.
 */
export function createInput(opts: {
  onInteract: () => void
  isEnabled: () => boolean
}): InputController {
  const state: InputState = { up: false, down: false, left: false, right: false }

  const press = (key: MoveKey) => {
    if (!opts.isEnabled()) return
    state[key] = true
  }

  const release = (key: MoveKey) => {
    state[key] = false
  }

  const interact = () => {
    if (!opts.isEnabled()) return
    opts.onInteract()
  }

  const handleDown = (e: KeyboardEvent) => {
    if (!opts.isEnabled()) return
    const mapped = KEY_MAP[e.key]
    if (mapped) {
      state[mapped] = true
      e.preventDefault()
      return
    }
    if (INTERACT_KEYS.has(e.key)) {
      e.preventDefault()
      opts.onInteract()
    }
  }

  const handleUp = (e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key]
    if (mapped) {
      state[mapped] = false
      e.preventDefault()
    }
  }

  // Release everything if the window loses focus (avoids "stuck" keys).
  const handleBlur = () => {
    state.up = state.down = state.left = state.right = false
  }

  window.addEventListener('keydown', handleDown)
  window.addEventListener('keyup', handleUp)
  window.addEventListener('blur', handleBlur)

  return {
    state,
    press,
    release,
    interact,
    dispose: () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', handleBlur)
    },
  }
}
