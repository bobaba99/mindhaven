import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('returns a new array and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    const out = shuffle(input)
    expect(out).not.toBe(input)
    expect(input).toEqual(copy)
  })

  it('is a permutation: same length and same multiset of elements', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f']
    const out = shuffle(input)
    expect(out).toHaveLength(input.length)
    expect([...out].sort()).toEqual([...input].sort())
  })

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([])
    expect(shuffle([42])).toEqual([42])
  })

  it('eventually produces a different order (not frozen)', () => {
    const input = Array.from({ length: 20 }, (_, i) => i)
    const reordered = Array.from({ length: 10 }, () => shuffle(input))
    const anyDifferent = reordered.some(
      (out) => out.some((v, i) => v !== input[i]),
    )
    expect(anyDifferent).toBe(true)
  })
})
