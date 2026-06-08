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

/**
 * Keyboard input controller. Tracks held movement keys and fires a callback on
 * the interact key. Returns a disposer. `enabled` lets callers freeze movement
 * while an overlay is open (we still read interact via React there).
 */
export function createInput(opts: {
  onInteract: () => void
  isEnabled: () => boolean
}): { state: InputState; dispose: () => void } {
  const state: InputState = { up: false, down: false, left: false, right: false }

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
    dispose: () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', handleBlur)
    },
  }
}

export { INTERACT_KEYS }
