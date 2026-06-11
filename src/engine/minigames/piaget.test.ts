import { describe, expect, it } from 'vitest'
import {
  STAGES,
  TASKS,
  classifyTask,
  initialPiaget,
  isComplete,
  placeTask,
} from './piaget'

describe('piaget stage data', () => {
  it('lists the four canonical stages in developmental order', () => {
    expect(STAGES.map((s) => s.id)).toEqual([
      'sensorimotor',
      'preoperational',
      'concrete',
      'formal',
    ])
  })

  it('provides at least two task cards per stage with unique ids', () => {
    expect(new Set(TASKS.map((t) => t.id)).size).toBe(TASKS.length)
    for (const stage of STAGES) {
      expect(TASKS.filter((t) => t.stage === stage.id).length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('piaget sorting', () => {
  it('classifies a task against its true stage', () => {
    const t = TASKS[0]
    expect(classifyTask(t.id, t.stage)).toBe(true)
    const wrong = STAGES.find((s) => s.id !== t.stage)!
    expect(classifyTask(t.id, wrong.id)).toBe(false)
  })

  it('placing a task on the right stage records it', () => {
    const t = TASKS[0]
    const { state, correct } = placeTask(initialPiaget(), t.id, t.stage)
    expect(correct).toBe(true)
    expect(state.placed[t.id]).toBe(t.stage)
    expect(state.mistakes).toBe(0)
  })

  it('placing a task on the wrong stage counts a mistake and leaves it unplaced', () => {
    const t = TASKS[0]
    const wrong = STAGES.find((s) => s.id !== t.stage)!
    const { state, correct } = placeTask(initialPiaget(), t.id, wrong.id)
    expect(correct).toBe(false)
    expect(state.placed[t.id]).toBeUndefined()
    expect(state.mistakes).toBe(1)
  })

  it('is complete once every task card is placed', () => {
    let s = initialPiaget()
    expect(isComplete(s)).toBe(false)
    for (const t of TASKS) {
      s = placeTask(s, t.id, t.stage).state
    }
    expect(isComplete(s)).toBe(true)
  })

  it('never mutates the input state', () => {
    const s = initialPiaget()
    placeTask(s, TASKS[0].id, TASKS[0].stage)
    expect(s).toEqual(initialPiaget())
  })
})
