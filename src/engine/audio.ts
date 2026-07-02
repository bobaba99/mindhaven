/**
 * Tiny procedural SFX engine — every sound is synthesized with WebAudio
 * oscillators (no audio assets, matching the all-procedural art rule).
 * Every call is failure-safe: no AudioContext, no sound, no crash.
 */
export type SfxName =
  | 'blip'
  | 'chime'
  | 'insight'
  | 'unlock'
  | 'locked'
  | 'flip'
  | 'match'
  | 'miss'
  | 'tick'

export const MUTE_STORAGE_KEY = 'mindhaven.muted.v1'
export const VOLUME_STORAGE_KEY = 'mindhaven.volume.v1'

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0')
  } catch {
    // storage unavailable — mute state just won't persist
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/** Master volume in [0, 1], applied to SFX and music alike. Defaults to 1. */
export function getVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    if (raw === null) return 1
    const v = Number(raw)
    return Number.isFinite(v) ? clamp01(v) : 1
  } catch {
    return 1
  }
}

export function setVolume(volume: number): void {
  const v = Number.isFinite(volume) ? clamp01(volume) : 1
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(v))
  } catch {
    // storage unavailable — volume just won't persist
  }
}

type AudioContextCtor = new () => AudioContext

let sharedCtx: AudioContext | null = null

/**
 * The shared context if one already exists — never creates or resumes it.
 * For teardown paths (fades, stops) that must not wake a suspended context.
 */
export function peekAudioContext(): AudioContext | null {
  return sharedCtx
}

/** Lazily create (and resume) the context — must follow a user gesture. */
export function getAudioContext(): AudioContext | null {
  try {
    if (!sharedCtx) {
      const w = window as Window & { webkitAudioContext?: AudioContextCtor }
      const Ctor = window.AudioContext ?? w.webkitAudioContext
      if (!Ctor) return null
      sharedCtx = new Ctor()
    }
    if (sharedCtx.state === 'suspended') {
      void sharedCtx.resume()
    }
    return sharedCtx
  } catch {
    return null
  }
}

export interface Note {
  freq: number
  /** Seconds after "now" the note starts. */
  at: number
  dur: number
  type: OscillatorType
  vol: number
}

/**
 * Schedule notes at an absolute context time onto a destination node.
 * Shared by fire-and-forget SFX and the music engine's bar scheduler.
 */
export function scheduleNotes(
  ctx: AudioContext,
  destination: AudioNode,
  notes: Note[],
  startAt: number,
  volumeScale = 1,
): void {
  for (const n of notes) {
    const vol = n.vol * volumeScale
    if (vol <= 0) continue
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = n.type
    osc.frequency.value = n.freq
    gain.gain.setValueAtTime(vol, startAt + n.at)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + n.at + n.dur)
    osc.connect(gain)
    gain.connect(destination)
    osc.start(startAt + n.at)
    osc.stop(startAt + n.at + n.dur + 0.02)
  }
}

function playNotes(ctx: AudioContext, notes: Note[]): void {
  scheduleNotes(ctx, ctx.destination, notes, ctx.currentTime, getVolume())
}

const RECIPES: Record<SfxName, Note[]> = {
  blip: [{ freq: 660, at: 0, dur: 0.07, type: 'square', vol: 0.035 }],
  chime: [
    { freq: 880, at: 0, dur: 0.16, type: 'sine', vol: 0.06 },
    { freq: 1318.5, at: 0.09, dur: 0.22, type: 'sine', vol: 0.05 },
  ],
  insight: [
    { freq: 987.8, at: 0, dur: 0.09, type: 'triangle', vol: 0.06 },
    { freq: 1174.7, at: 0.08, dur: 0.14, type: 'triangle', vol: 0.05 },
  ],
  unlock: [
    { freq: 523.3, at: 0, dur: 0.12, type: 'sine', vol: 0.06 },
    { freq: 659.3, at: 0.1, dur: 0.12, type: 'sine', vol: 0.06 },
    { freq: 784, at: 0.2, dur: 0.12, type: 'sine', vol: 0.06 },
    { freq: 1046.5, at: 0.3, dur: 0.26, type: 'sine', vol: 0.07 },
  ],
  locked: [
    { freq: 130.8, at: 0, dur: 0.12, type: 'square', vol: 0.05 },
    { freq: 98, at: 0.1, dur: 0.16, type: 'square', vol: 0.045 },
  ],
  // card flicks over: quick upward swish
  flip: [
    { freq: 520, at: 0, dur: 0.05, type: 'triangle', vol: 0.035 },
    { freq: 780, at: 0.035, dur: 0.07, type: 'triangle', vol: 0.03 },
  ],
  // pair found: bright little arpeggio
  match: [
    { freq: 880, at: 0, dur: 0.1, type: 'sine', vol: 0.05 },
    { freq: 1108.7, at: 0.08, dur: 0.12, type: 'sine', vol: 0.05 },
    { freq: 1318.5, at: 0.16, dur: 0.2, type: 'sine', vol: 0.045 },
  ],
  // not a pair: gentle low shrug
  miss: [
    { freq: 233.1, at: 0, dur: 0.09, type: 'triangle', vol: 0.04 },
    { freq: 185, at: 0.07, dur: 0.13, type: 'triangle', vol: 0.035 },
  ],
  // typewriter key landing — kept nearly subliminal
  tick: [{ freq: 1850, at: 0, dur: 0.018, type: 'square', vol: 0.012 }],
}

/** Fire-and-forget a named sound effect. Silent when muted or unsupported. */
export function playSfx(name: SfxName): void {
  if (isMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    playNotes(ctx, RECIPES[name])
  } catch {
    // a transient WebAudio failure should never break the game
  }
}
