import { afterEach, describe, expect, it, vi } from 'vitest'
import { createInput } from './input'

function make(enabled = true) {
  const onInteract = vi.fn()
  const input = createInput({ onInteract, isEnabled: () => enabled })
  return { input, onInteract }
}

const disposers: Array<() => void> = []
afterEach(() => {
  while (disposers.length) disposers.pop()!()
})

describe('createInput programmatic controls (touch)', () => {
  it('press and release toggle a movement direction', () => {
    const { input } = make()
    disposers.push(input.dispose)
    input.press('left')
    expect(input.state.left).toBe(true)
    input.release('left')
    expect(input.state.left).toBe(false)
  })

  it('press is ignored while disabled', () => {
    const { input } = make(false)
    disposers.push(input.dispose)
    input.press('up')
    expect(input.state.up).toBe(false)
  })

  it('release always lands, even while disabled (no stuck keys)', () => {
    let enabled = true
    const onInteract = vi.fn()
    const input = createInput({ onInteract, isEnabled: () => enabled })
    disposers.push(input.dispose)
    input.press('right')
    enabled = false
    input.release('right')
    expect(input.state.right).toBe(false)
  })

  it('releaseAll clears every held direction (overlay-open safety)', () => {
    let enabled = true
    const onInteract = vi.fn()
    const input = createInput({ onInteract, isEnabled: () => enabled })
    disposers.push(input.dispose)
    input.press('left')
    input.press('up')
    // an overlay opens mid-hold: the touch buttons unmount and their
    // pointerup may never fire — releaseAll is the recovery path
    enabled = false
    input.releaseAll()
    expect(input.state).toEqual({ up: false, down: false, left: false, right: false })
  })

  it('interact fires the callback only while enabled', () => {
    let enabled = true
    const onInteract = vi.fn()
    const input = createInput({ onInteract, isEnabled: () => enabled })
    disposers.push(input.dispose)
    input.interact()
    expect(onInteract).toHaveBeenCalledTimes(1)
    enabled = false
    input.interact()
    expect(onInteract).toHaveBeenCalledTimes(1)
  })
})

describe('createInput keyboard handling', () => {
  it('maps held arrow keys into the movement state', () => {
    const { input } = make()
    disposers.push(input.dispose)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(input.state.left).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    expect(input.state.left).toBe(false)
  })

  it('fires interact on E', () => {
    const { input, onInteract } = make()
    disposers.push(input.dispose)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))
    expect(onInteract).toHaveBeenCalledTimes(1)
  })

  it('clears all held keys when the window blurs', () => {
    const { input } = make()
    disposers.push(input.dispose)
    input.press('up')
    input.press('right')
    window.dispatchEvent(new Event('blur'))
    expect(input.state).toEqual({ up: false, down: false, left: false, right: false })
  })

  it('stops listening after dispose', () => {
    const { input, onInteract } = make()
    input.dispose()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))
    expect(onInteract).not.toHaveBeenCalled()
  })
})
