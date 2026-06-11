import { describe, expect, it } from 'vitest'
import {
  CONDITIONING_THRESHOLD,
  PAIRING_GAIN,
  chimeAlone,
  initialWatson,
  isConditioned,
  pairStimuli,
} from './watson'

describe('watson gentle-conditioning model', () => {
  it('starts unconditioned with no association', () => {
    const s = initialWatson()
    expect(s.association).toBe(0)
    expect(s.pairings).toBe(0)
    expect(s.calmResponses).toBe(0)
    expect(isConditioned(s)).toBe(false)
  })

  it('each gentle pairing strengthens the association by PAIRING_GAIN', () => {
    const s1 = pairStimuli(initialWatson())
    expect(s1.pairings).toBe(1)
    expect(s1.association).toBe(PAIRING_GAIN)
  })

  it('association caps at 100 no matter how many pairings', () => {
    let s = initialWatson()
    for (let i = 0; i < 10; i++) s = pairStimuli(s)
    expect(s.association).toBe(100)
  })

  it('becomes conditioned once association reaches the threshold', () => {
    let s = initialWatson()
    while (s.association < CONDITIONING_THRESHOLD) s = pairStimuli(s)
    expect(isConditioned(s)).toBe(true)
  })

  it('chime alone before conditioning produces no calm response', () => {
    const { state, response } = chimeAlone(initialWatson())
    expect(response).toBe('none')
    expect(state.calmResponses).toBe(0)
  })

  it('chime alone after conditioning produces a calm response', () => {
    let s = initialWatson()
    for (let i = 0; i < 4; i++) s = pairStimuli(s)
    const { state, response } = chimeAlone(s)
    expect(response).toBe('calm')
    expect(state.calmResponses).toBe(1)
  })

  it('never mutates the input state', () => {
    const s = initialWatson()
    pairStimuli(s)
    chimeAlone(s)
    expect(s).toEqual(initialWatson())
  })
})
