import { beforeEach, describe, expect, it } from 'vitest'
import {
  MUTE_STORAGE_KEY,
  VOLUME_STORAGE_KEY,
  getVolume,
  isMuted,
  playSfx,
  setMuted,
  setVolume,
} from './audio'

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

describe('volume persistence', () => {
  it('defaults to full volume', () => {
    expect(getVolume()).toBe(1)
  })

  it('persists and clamps to [0, 1]', () => {
    setVolume(0.6)
    expect(getVolume()).toBe(0.6)
    expect(localStorage.getItem(VOLUME_STORAGE_KEY)).toBe('0.6')
    setVolume(4)
    expect(getVolume()).toBe(1)
    setVolume(-2)
    expect(getVolume()).toBe(0)
  })

  it('treats corrupt or non-finite storage as full volume', () => {
    localStorage.setItem(VOLUME_STORAGE_KEY, 'loud')
    expect(getVolume()).toBe(1)
    setVolume(Number.NaN)
    expect(getVolume()).toBe(1)
  })
})

describe('playSfx resilience', () => {
  it('never throws when AudioContext is unavailable (jsdom has none)', () => {
    expect(() => playSfx('blip')).not.toThrow()
    expect(() => playSfx('chime')).not.toThrow()
    expect(() => playSfx('insight')).not.toThrow()
    expect(() => playSfx('unlock')).not.toThrow()
    expect(() => playSfx('locked')).not.toThrow()
    expect(() => playSfx('flip')).not.toThrow()
    expect(() => playSfx('match')).not.toThrow()
    expect(() => playSfx('miss')).not.toThrow()
    expect(() => playSfx('tick')).not.toThrow()
  })

  it('never throws while muted either', () => {
    setMuted(true)
    expect(() => playSfx('blip')).not.toThrow()
  })
})
