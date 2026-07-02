import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BUILDINGS } from '../data/buildings'
import { setMuted } from './audio'
import {
  BAR_SECONDS,
  STINGER_SECONDS,
  composeBar,
  isMusicPlaying,
  playStinger,
  setMusicDrift,
  startMusic,
  stingerFor,
  stopMusic,
  themeParamsFor,
} from './music'

/** Deterministic rng for reproducible composition tests. */
function seededRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

beforeEach(() => {
  localStorage.clear()
  stopMusic()
})

describe('themeParamsFor (west → east drift)', () => {
  it('clamps drift outside [0, 1]', () => {
    expect(themeParamsFor(-2)).toEqual(themeParamsFor(0))
    expect(themeParamsFor(9)).toEqual(themeParamsFor(1))
    expect(themeParamsFor(Number.NaN)).toEqual(themeParamsFor(0))
  })

  it('gets denser as the player walks east', () => {
    const west = themeParamsFor(0)
    const mid = themeParamsFor(0.5)
    const east = themeParamsFor(1)
    expect(west.density).toBeLessThan(mid.density)
    expect(mid.density).toBeLessThan(east.density)
  })

  it('sustains lengthen from clockwork west to warm east', () => {
    expect(themeParamsFor(0).sustain).toBeLessThan(themeParamsFor(1).sustain)
  })

  it('moves from clockwork square to warm sine timbre', () => {
    expect(themeParamsFor(0).wave).toBe('square')
    expect(themeParamsFor(1).wave).toBe('sine')
  })
})

describe('composeBar', () => {
  it('keeps every note inside one bar with sane volume and duration', () => {
    for (const drift of [0, 0.25, 0.5, 0.75, 1]) {
      const notes = composeBar(drift, seededRng(42))
      expect(notes.length).toBeGreaterThan(0)
      for (const n of notes) {
        expect(n.at).toBeGreaterThanOrEqual(0)
        expect(n.at).toBeLessThan(BAR_SECONDS)
        expect(n.dur).toBeGreaterThan(0)
        expect(n.vol).toBeGreaterThan(0)
        expect(n.vol).toBeLessThanOrEqual(0.08)
        expect(Number.isFinite(n.freq)).toBe(true)
        expect(n.freq).toBeGreaterThan(50)
        expect(n.freq).toBeLessThan(2500)
      }
    }
  })

  it('always sounds the downbeat so the bar is never empty', () => {
    // even a stingy rng that suppresses every optional slot keeps the downbeat
    const notes = composeBar(0, () => 0.999999)
    expect(notes.some((n) => n.at === 0)).toBe(true)
  })

  it('is deterministic for a fixed rng', () => {
    expect(composeBar(0.5, seededRng(7))).toEqual(composeBar(0.5, seededRng(7)))
  })

  it('plays more notes in the east than the west on average', () => {
    let west = 0
    let east = 0
    for (let i = 0; i < 40; i++) {
      west += composeBar(0, seededRng(i)).length
      east += composeBar(1, seededRng(i)).length
    }
    expect(east).toBeGreaterThan(west)
  })
})

describe('stingerFor (per-building interior motifs)', () => {
  it('gives every building a non-empty two-bar motif', () => {
    for (const b of BUILDINGS) {
      const motif = stingerFor(b.id)
      expect(motif.length, b.id).toBeGreaterThanOrEqual(4)
      for (const n of motif) {
        expect(n.at).toBeGreaterThanOrEqual(0)
        expect(n.at).toBeLessThan(STINGER_SECONDS)
        expect(n.dur).toBeGreaterThan(0)
        expect(n.vol).toBeGreaterThan(0)
        expect(n.vol).toBeLessThanOrEqual(0.09)
      }
    }
  })

  it('is deterministic per building', () => {
    for (const b of BUILDINGS) {
      expect(stingerFor(b.id)).toEqual(stingerFor(b.id))
    }
  })

  it('gives different schools recognisably different motifs', () => {
    // At least half of all building pairs should differ — motifs are
    // per-building, not one shared jingle.
    const motifs = BUILDINGS.map((b) => JSON.stringify(stingerFor(b.id)))
    expect(new Set(motifs).size).toBeGreaterThan(BUILDINGS.length / 2)
  })

  it('falls back safely for unknown ids', () => {
    const motif = stingerFor('not-a-real-building')
    expect(motif.length).toBeGreaterThan(0)
  })
})

describe('runtime scheduler resilience (jsdom has no AudioContext)', () => {
  it('start/stop/drift/stinger never throw without WebAudio', () => {
    expect(() => setMusicDrift(0.5)).not.toThrow()
    expect(() => startMusic()).not.toThrow()
    expect(() => playStinger('freud-couch')).not.toThrow()
    expect(() => stopMusic()).not.toThrow()
  })

  it('reports not-playing when WebAudio is unavailable', () => {
    startMusic()
    expect(isMusicPlaying()).toBe(false)
  })
})

// NOTE: keep this block LAST in the file — installing the stub makes audio.ts
// cache a context, and the no-WebAudio tests above rely on there being none.
describe('runtime scheduler with a stubbed AudioContext', () => {
  const created = { gains: 0, oscillators: 0 }

  class FakeParam {
    value = 1
    setValueAtTime() {}
    exponentialRampToValueAtTime() {}
    setTargetAtTime() {}
  }
  class FakeGain {
    gain = new FakeParam()
    connect() {}
    disconnect() {}
  }
  class FakeOscillator {
    type: OscillatorType = 'sine'
    frequency = { value: 0 }
    connect() {}
    start() {}
    stop() {}
  }
  class FakeAudioContext {
    currentTime = 0
    state = 'running'
    destination = new FakeGain()
    createGain() {
      created.gains++
      return new FakeGain()
    }
    createOscillator() {
      created.oscillators++
      return new FakeOscillator()
    }
    resume() {
      return Promise.resolve()
    }
  }

  beforeAll(() => {
    ;(window as unknown as Record<string, unknown>).AudioContext =
      FakeAudioContext
  })

  afterAll(() => {
    stopMusic()
    delete (window as unknown as Record<string, unknown>).AudioContext
  })

  it('the mute guard short-circuits before any node is created', () => {
    setMuted(true)
    created.gains = 0
    startMusic()
    expect(isMusicPlaying()).toBe(false)
    expect(created.gains).toBe(0)
    setMuted(false)
  })

  it('starts, schedules bars ahead, and stops cleanly', () => {
    created.oscillators = 0
    startMusic()
    expect(isMusicPlaying()).toBe(true)
    // the immediate look-ahead pass must have queued at least one bar
    expect(created.oscillators).toBeGreaterThan(0)
    stopMusic()
    expect(isMusicPlaying()).toBe(false)
  })

  it('is idempotent: a second start does not stack a second theme', () => {
    startMusic()
    const after = created.gains
    startMusic()
    expect(created.gains).toBe(after)
    stopMusic()
  })
})
