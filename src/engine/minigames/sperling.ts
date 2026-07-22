/**
 * Sperling's Flash-Photo Kiosk — the 1960 iconic-memory experiments. A grid
 * of letters flashes for a fraction of a second; whole report retrieves ~4,
 * a cued partial report shows nearly everything was briefly there.
 */
export const GRID_SIZE = 3

/** Consonants, minus easily-confused pairs (no I/l, O/Q; B/P kept apart by pool). */
const LETTER_POOL = [
  'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
  'N', 'R', 'S', 'T', 'V', 'X', 'Z',
] as const

export interface SelectionScore {
  hits: number
  falseAlarms: number
}

/** A 3x3 grid of distinct letters, composition via the injected shuffle. */
export function buildSperlingGrid(
  shuffleFn: <T>(arr: T[]) => T[],
): string[][] {
  const letters = shuffleFn([...LETTER_POOL]).slice(0, GRID_SIZE * GRID_SIZE)
  const grid: string[][] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    grid.push(letters.slice(r * GRID_SIZE, (r + 1) * GRID_SIZE))
  }
  return grid
}

/** Answer bank: every grid letter + the remaining pool as distractors. */
export function buildLetterBank(
  grid: string[][],
  shuffleFn: <T>(arr: T[]) => T[],
): string[] {
  const inGrid = new Set(grid.flat())
  const distractors = LETTER_POOL.filter((c) => !inGrid.has(c))
  return shuffleFn([...inGrid, ...distractors])
}

/** Score picks against the cued row (letters elsewhere count as misses). */
export function scoreSelection(
  cuedRow: readonly string[],
  picked: ReadonlySet<string>,
): SelectionScore {
  const targets = new Set(cuedRow)
  let hits = 0
  let falseAlarms = 0
  for (const p of picked) {
    if (targets.has(p)) hits += 1
    else falseAlarms += 1
  }
  return { hits, falseAlarms }
}

export function summarizeSperling(score: {
  wholeHits: number
  partialHits: number
}): string {
  return (
    `Whole report: ${score.wholeHits} of 9 letters. Partial report on one cued row: ${score.partialHits} of ${GRID_SIZE}. ` +
    'That gap is the 1960 discovery: for a quarter-second or so, an iconic image of the WHOLE display persists — the cue arrives in time to read any row off it, so nearly everything must have been momentarily available. ' +
    'Report everything and the icon fades before your mouth catches up; that is why whole report tops out near four items. The photograph develops instantly and evaporates almost as fast.'
  )
}
