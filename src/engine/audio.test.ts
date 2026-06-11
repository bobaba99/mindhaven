import { beforeEach, describe, expect, it } from 'vitest'
import { MUTE_STORAGE_KEY, isMuted, playSfx, setMuted } from './audio'

beforeEach(() => {
  localStorage.clear()
})

describe('audio mute persistence', () => {
  it('defaults to unmuted', () => {
    expect(isMuted()).toBe(false)
  })

  it('persists the muted flag across reads', () => {
    setMuted(true)
    expect(isMuted()).toBe(true)
    expect(localStorage.getItem(MUTE_STORAGE_KEY)).toBe('1')
    setMuted(false)
    expect(isMuted()).toBe(false)
  })

  it('treats corrupt storage as unmuted', () => {
    localStorage.setItem(MUTE_STORAGE_KEY, '{nonsense')
    expect(isMuted()).toBe(false)
  })
})

describe('playSfx resilience', () => {
  it('never throws when AudioContext is unavailable (jsdom has none)', () => {
    expect(() => playSfx('blip')).not.toThrow()
    expect(() => playSfx('chime')).not.toThrow()
    expect(() => playSfx('insight')).not.toThrow()
    expect(() => playSfx('unlock')).not.toThrow()
    expect(() => playSfx('locked')).not.toThrow()
  })

  it('never throws while muted either', () => {
    setMuted(true)
    expect(() => playSfx('blip')).not.toThrow()
  })
})
