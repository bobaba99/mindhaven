import { describe, expect, it } from 'vitest'
import {
  GRID_SIZE,
  buildSperlingGrid,
  buildLetterBank,
  scoreSelection,
  summarizeSperling,
} from './sperling'

const noShuffle = <T,>(arr: T[]): T[] => [...arr]

describe("Sperling's flash-photo kiosk", () => {
  it('builds a 3x3 grid of distinct consonants', () => {
    const grid = buildSperlingGrid(noShuffle)
    expect(grid).toHaveLength(GRID_SIZE)
    for (const row of grid) expect(row).toHaveLength(GRID_SIZE)
    const flat = grid.flat()
    expect(new Set(flat).size).toBe(GRID_SIZE * GRID_SIZE)
    for (const ch of flat) expect(ch).toMatch(/^[B-DF-HJ-NP-TV-Z]$/)
  })

  it('is deterministic for a given shuffle', () => {
    expect(buildSperlingGrid(noShuffle)).toEqual(buildSperlingGrid(noShuffle))
  })

  it('letter bank contains every grid letter plus distinct distractors', () => {
    const grid = buildSperlingGrid(noShuffle)
    const bank = buildLetterBank(grid, noShuffle)
    const flat = grid.flat()
    for (const ch of flat) expect(bank).toContain(ch)
    expect(bank.length).toBeGreaterThan(flat.length)
    expect(new Set(bank).size).toBe(bank.length)
  })

  it('scoreSelection counts hits within the cued row only', () => {
    const grid = buildSperlingGrid(noShuffle)
    const row = grid[1]
    const perfect = scoreSelection(row, new Set(row))
    expect(perfect.hits).toBe(GRID_SIZE)
    expect(perfect.falseAlarms).toBe(0)
    const cross = scoreSelection(row, new Set([row[0], grid[0][0]]))
    expect(cross.hits).toBe(1)
    expect(cross.falseAlarms).toBe(1)
  })

  it('summary contrasts whole report with partial report', () => {
    const msg = summarizeSperling({ wholeHits: 4, partialHits: 3 })
    expect(msg).toMatch(/partial/i)
    expect(msg).toMatch(/icon|iconic/i)
  })
})
