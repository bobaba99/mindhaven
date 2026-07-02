/**
 * Procedural ambient music — the v1.2 "Music of the Spheres" engine.
 *
 * Like the SFX, everything is synthesized with WebAudio oscillators: no audio
 * assets. The town theme is composed one bar at a time by a look-ahead
 * scheduler; a `drift` value (the player's west→east position, 0..1) shapes
 * each bar — the 1879 end of the street is sparse and clockwork-like, the
 * modern end warmer and denser. Entering a building plays a short two-bar
 * stinger flavored by that school of thought. Every call is failure-safe.
 */
import { BUILDINGS } from '../data/buildings'
import {
  getAudioContext,
  getVolume,
  isMuted,
  peekAudioContext,
  scheduleNotes,
  type Note,
} from './audio'

export const BPM = 84
export const BEATS_PER_BAR = 4
export const BAR_SECONDS = (60 / BPM) * BEATS_PER_BAR
/** Eighth-note slots the composer fills (or rests) per bar. */
const SLOTS_PER_BAR = 8
const SLOT_SECONDS = BAR_SECONDS / SLOTS_PER_BAR

/** Stingers are two brisk bars. */
const STINGER_BAR_SECONDS = 1.25
export const STINGER_SECONDS = STINGER_BAR_SECONDS * 2

/** The theme sits well under the SFX so prompts and chimes always read. */
const MUSIC_LEVEL = 0.55

/** A-minor pentatonic — gentle, no wrong notes when slots collide. */
const SCALE = [220, 261.63, 293.66, 329.63, 392]
/** Warm low roots the east end leans on (A2, D3, G2). */
const ROOTS = [110, 146.83, 98]

export interface ThemeParams {
  /** Probability an eighth-note slot sounds. */
  density: number
  /** Note length in seconds. */
  sustain: number
  /** Melodic timbre for this stretch of the street. */
  wave: OscillatorType
  /** Probability a sounding slot doubles into a soft third/fifth. */
  chordProb: number
  /** Probability the downbeat gains a warm low root note. */
  rootProb: number
}

function clamp01(v: number): number {
  return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0
}

/** How the theme reshapes as the player walks 1879 → the modern end. */
export function themeParamsFor(drift: number): ThemeParams {
  const d = clamp01(drift)
  return {
    density: 0.3 + 0.45 * d,
    sustain: 0.14 + 0.5 * d,
    wave: d < 1 / 3 ? 'square' : d < 2 / 3 ? 'triangle' : 'sine',
    chordProb: 0.35 * d,
    rootProb: 0.25 + 0.55 * d,
  }
}

/**
 * Compose one bar of the town theme. Pure: all randomness comes from `rng`.
 * The downbeat always sounds so the pulse never drops out entirely.
 */
export function composeBar(drift: number, rng: () => number): Note[] {
  const p = themeParamsFor(drift)
  const notes: Note[] = []
  let degree = Math.floor(rng() * SCALE.length)

  for (let slot = 0; slot < SLOTS_PER_BAR; slot++) {
    const isDownbeat = slot === 0
    if (!isDownbeat && rng() >= p.density) continue

    // drunkard's walk over the scale keeps phrases stepwise and singable
    const step = Math.floor(rng() * 3) - 1
    degree = Math.min(SCALE.length - 1, Math.max(0, degree + step))
    const octaveUp = rng() < 0.25
    const freq = SCALE[degree] * (octaveUp ? 2 : 1)
    const at = slot * SLOT_SECONDS
    const vol = isDownbeat ? 0.05 : 0.028 + rng() * 0.014

    notes.push({ freq, at, dur: p.sustain, type: p.wave, vol })

    if (rng() < p.chordProb) {
      const partner = Math.min(SCALE.length - 1, degree + 2)
      notes.push({
        freq: SCALE[partner],
        at,
        dur: p.sustain * 1.2,
        type: 'sine',
        vol: vol * 0.55,
      })
    }
  }

  if (rng() < themeParamsFor(drift).rootProb) {
    notes.push({
      freq: ROOTS[Math.floor(rng() * ROOTS.length)],
      at: 0,
      dur: Math.max(0.5, themeParamsFor(drift).sustain * 2.2),
      type: 'sine',
      vol: 0.04,
    })
  }

  return notes
}

/** Deterministic 32-bit hash → seeded rng, so motifs are stable per building. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

interface MotifFlavor {
  wave: OscillatorType
  /** Semitone offsets from the motif root. */
  scale: number[]
  rootFreq: number
}

const MAJOR_PENTA = [0, 2, 4, 7, 9, 12]
const MINOR_PENTA = [0, 3, 5, 7, 10, 12]
const DORIAN_LIFT = [0, 2, 3, 7, 9, 12]

/** Flavor a school of thought: behaviorists tick, analysts drift, humanists glow. */
function flavorFor(school: string): MotifFlavor {
  const s = school.toLowerCase()
  if (s.includes('conditioning') || s.includes('behaviorism')) {
    return { wave: 'square', scale: MAJOR_PENTA, rootFreq: 293.66 }
  }
  if (s.includes('psychoanalysis') || s.includes('analytical')) {
    return { wave: 'sine', scale: MINOR_PENTA, rootFreq: 220 }
  }
  if (s.includes('humanistic')) {
    return { wave: 'triangle', scale: MAJOR_PENTA, rootFreq: 261.63 }
  }
  if (s.includes('cognitive') || s.includes('memory')) {
    return { wave: 'triangle', scale: DORIAN_LIFT, rootFreq: 246.94 }
  }
  if (s.includes('social')) {
    return { wave: 'square', scale: DORIAN_LIFT, rootFreq: 220 }
  }
  return { wave: 'sine', scale: MINOR_PENTA, rootFreq: 220 }
}

const SCHOOL_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b.school]))

/**
 * A building's interior stinger: a deterministic two-bar motif whose timbre
 * and mode come from its school of thought and whose contour comes from a
 * hash of its id — every shop hums its own tune, forever.
 */
export function stingerFor(buildingId: string): Note[] {
  const flavor = flavorFor(SCHOOL_BY_ID.get(buildingId) ?? '')
  const rng = mulberry32(hashString(buildingId))
  const notes: Note[] = []
  const slots = 8 // quarter notes across two brisk bars
  const slotDur = STINGER_SECONDS / slots
  let degree = 0

  for (let i = 0; i < slots; i++) {
    // rest occasionally mid-phrase, never on the first or last beat
    if (i !== 0 && i !== slots - 1 && rng() < 0.2) continue
    const step = Math.floor(rng() * 3) - 1
    degree = Math.min(flavor.scale.length - 1, Math.max(0, degree + step))
    // the last beat resolves home to the root
    const semis = i === slots - 1 ? 0 : flavor.scale[degree]
    notes.push({
      freq: flavor.rootFreq * Math.pow(2, semis / 12),
      at: i * slotDur,
      dur: slotDur * (i === slots - 1 ? 1.6 : 0.85),
      type: flavor.wave,
      vol: i === 0 || i === slots - 1 ? 0.055 : 0.04 + rng() * 0.012,
    })
  }
  return notes
}

// --- runtime scheduler -----------------------------------------------------

/** Schedule this far ahead so background-tab timer throttling can't gap it. */
const LOOKAHEAD_SECONDS = 3
const SCHEDULER_INTERVAL_MS = 300

let playing = false
let drift = 0
let timer: number | null = null
let nextBarAt = 0
let masterGain: GainNode | null = null

/** Feed the player's normalized west→east position (0..1) each frame. */
export function setMusicDrift(x: number): void {
  drift = clamp01(x)
}

export function isMusicPlaying(): boolean {
  return playing
}

function scheduleAhead(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx || !playing || !masterGain) return
    while (nextBarAt < ctx.currentTime + LOOKAHEAD_SECONDS) {
      // a bar the tab slept through is skipped, not crammed in
      if (nextBarAt < ctx.currentTime) {
        nextBarAt = ctx.currentTime + 0.05
      }
      scheduleNotes(ctx, masterGain, composeBar(drift, Math.random), nextBarAt)
      nextBarAt += BAR_SECONDS
    }
  } catch {
    // a transient WebAudio failure should never break the game
  }
}

/** Start the town theme. No-op when muted, unsupported, or already playing. */
export function startMusic(): void {
  if (playing || isMuted()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    masterGain = ctx.createGain()
    masterGain.gain.value = MUSIC_LEVEL * getVolume()
    masterGain.connect(ctx.destination)
    playing = true
    nextBarAt = ctx.currentTime + 0.1
    scheduleAhead()
    timer = window.setInterval(scheduleAhead, SCHEDULER_INTERVAL_MS)
  } catch {
    playing = false
    masterGain = null
  }
}

/** Fade the theme out and stop scheduling. Safe to call at any time. */
export function stopMusic(): void {
  playing = false
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
  const gain = masterGain
  masterGain = null
  if (!gain) return
  try {
    // peek, don't get: stopping must never wake a suspended context
    const ctx = peekAudioContext()
    if (ctx) {
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15)
      window.setTimeout(() => gain.disconnect(), 1000)
    } else {
      gain.disconnect()
    }
  } catch {
    // already torn down — fine
  }
}

/** Re-read the persisted volume into the live theme (slider feedback). */
export function syncMusicVolume(): void {
  try {
    const ctx = peekAudioContext()
    if (ctx && masterGain) {
      masterGain.gain.setTargetAtTime(
        MUSIC_LEVEL * getVolume(),
        ctx.currentTime,
        0.05,
      )
    }
  } catch {
    // no live theme to retune
  }
}

/**
 * Play a building's interior motif, briefly ducking the theme under it.
 * Fire-and-forget; silent when muted or unsupported.
 */
export function playStinger(buildingId: string): void {
  if (isMuted()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    scheduleNotes(ctx, ctx.destination, stingerFor(buildingId), ctx.currentTime, getVolume())
    if (masterGain && playing) {
      const g = masterGain.gain
      const level = MUSIC_LEVEL * getVolume()
      g.setTargetAtTime(level * 0.35, ctx.currentTime, 0.08)
      g.setTargetAtTime(level, ctx.currentTime + STINGER_SECONDS, 0.4)
    }
  } catch {
    // a transient WebAudio failure should never break the game
  }
}
