export interface MiniLecture {
  /** Stable id used for progress tracking. */
  id: string
  title: string
  /** 2-4 sentence blurb in the NPC's voice, faithful to the theory. */
  blurb: string
}

/** Identifies which interactive minigame (if any) a building exposes. */
export type HookKind =
  | 'reaction-time' // Wundt: tap when the lamp flashes
  | 'paired-memory' // Calkins: paired-associate matching
  | 'bell' // Pavlov: ring the bell, watch extinction
  | 'lever' // Skinner: variable-ratio lever press
  | 'maslow-stack' // Maslow: stack the needs pyramid
  | 'kahneman-snap' // Kahneman: fast vs slow snap question
  | 'stub' // styled "hook coming soon"

export interface Building {
  /** 1-indexed, west -> east chronological order. */
  order: number
  id: string
  /** Themed shop name, e.g. "Pavlov's Provisions". */
  name: string
  /** Real psychologist name(s). */
  figure: string
  dates: string
  school: string
  stardewAnalog: string
  /** In-character greeting shown in the dialogue panel. */
  intro: string
  /** One-line description of the gameplay hook. */
  hookDescription: string
  hookKind: HookKind
  lectures: MiniLecture[]
  /** Insight required before this building unlocks. 0 = open from start. */
  unlockCost: number
  /** Palette accent used to keep facades visually distinct. */
  palette: BuildingPalette
}

export interface BuildingPalette {
  wall: string
  wallDark: string
  roof: string
  roofDark: string
  door: string
  accent: string
}

export interface Townsperson {
  id: string
  name: string
  dates: string
  /** In-character flavor line. */
  blurb: string
  contribution: string
  /** Shirt color for the wandering sprite. */
  color: string
}
