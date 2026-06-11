import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypewriter } from './useTypewriter'

/**
 * Deterministic rAF harness: frames only advance when the test flushes them,
 * and the clock is whatever the test says it is.
 */
let nextId = 1
let pending = new Map<number, FrameRequestCallback>()
let nowMs = 0

function flushFrame(at: number) {
  nowMs = at
  const callbacks = [...pending.values()]
  pending.clear()
  act(() => {
    callbacks.forEach((cb) => cb(at))
  })
}

beforeEach(() => {
  nextId = 1
  pending = new Map()
  nowMs = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++
    pending.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    pending.delete(id)
  })
  vi.spyOn(performance, 'now').mockImplementation(() => nowMs)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const TEXT = 'The mind keeps a cellar.' // 24 chars

describe('useTypewriter', () => {
  it('reveals text over frames at the configured speed', () => {
    const { result } = renderHook(() => useTypewriter(TEXT, 50))
    expect(result.current.shown).toBe('')
    flushFrame(100) // 0.1s * 50cps = 5 chars
    expect(result.current.shown).toBe(TEXT.slice(0, 5))
    expect(result.current.done).toBe(false)
  })

  it('finishes naturally once enough time has elapsed', () => {
    const { result } = renderHook(() => useTypewriter(TEXT, 50))
    flushFrame(10_000)
    expect(result.current.shown).toBe(TEXT)
    expect(result.current.done).toBe(true)
  })

  it('skip() stays done even when a queued frame fires afterwards', () => {
    const { result } = renderHook(() => useTypewriter(TEXT, 50))
    flushFrame(100) // mid-flight; this schedules another frame
    act(() => {
      result.current.skip()
    })
    expect(result.current.done).toBe(true)
    // The frame that was already queued before skip must not revert it.
    flushFrame(120)
    expect(result.current.done).toBe(true)
    expect(result.current.shown).toBe(TEXT)
  })

  it('shows the full text immediately when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { result } = renderHook(() => useTypewriter(TEXT, 50))
    expect(result.current.done).toBe(true)
    expect(result.current.shown).toBe(TEXT)
  })
})
