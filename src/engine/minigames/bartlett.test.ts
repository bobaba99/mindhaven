import { describe, expect, it } from 'vitest'
import {
  GENERATIONS,
  ORIGINAL_PASSAGE,
  scoreGeneration,
  summarizeBartlett,
} from './bartlett'

describe("Bartlett's story-swap stand", () => {
  it('opens with a faithful War of the Ghosts passage', () => {
    expect(ORIGINAL_PASSAGE).toMatch(/canoe|Egulac|ghost/i)
    expect(ORIGINAL_PASSAGE.length).toBeGreaterThan(100)
  })

  it('each generation offers verbatim / schema / random options exactly once', () => {
    expect(GENERATIONS.length).toBeGreaterThanOrEqual(3)
    for (const g of GENERATIONS) {
      const kinds = g.options.map((o) => o.kind).sort()
      expect(kinds).toEqual(['random', 'schema', 'verbatim'])
      expect(g.detail.length).toBeGreaterThan(10)
      expect(g.term.length).toBeGreaterThan(0)
      expect(g.why.length).toBeGreaterThan(40)
    }
  })

  it('the schema option is the one memory actually produces', () => {
    for (const g of GENERATIONS) {
      const schema = g.options.find((o) => o.kind === 'schema')!
      expect(scoreGeneration(g, schema.text).correct).toBe(true)
      const verbatim = g.options.find((o) => o.kind === 'verbatim')!
      expect(scoreGeneration(g, verbatim.text).correct).toBe(false)
    }
  })

  it('generation terms cover leveling, sharpening, and rationalization', () => {
    const terms = GENERATIONS.map((g) => g.term.toLowerCase()).join(' ')
    expect(terms).toMatch(/level/)
    expect(terms).toMatch(/sharpen/)
    expect(terms).toMatch(/rational/)
  })

  it('summary references schema theory at any score', () => {
    for (let n = 0; n <= GENERATIONS.length; n++) {
      expect(summarizeBartlett(n)).toMatch(/schema/i)
    }
  })
})
