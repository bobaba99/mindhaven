import { describe, expect, it } from 'vitest'
import { GAZETTE_BYLINE, ISSUES, latestIssue } from './gazette'

describe('gazette issues', () => {
  it('has at least one issue with unique, ascending issue numbers', () => {
    expect(ISSUES.length).toBeGreaterThanOrEqual(1)
    const numbers = ISSUES.map((i) => i.number)
    expect(new Set(numbers).size).toBe(numbers.length)
    expect([...numbers].sort((a, b) => a - b)).toEqual(numbers)
  })

  it('every issue is fully written: headline, dateline, 2+ articles with bodies', () => {
    for (const issue of ISSUES) {
      expect(issue.headline.length).toBeGreaterThan(0)
      expect(issue.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(issue.version).toMatch(/^v\d+\.\d+/)
      expect(issue.articles.length).toBeGreaterThanOrEqual(2)
      for (const a of issue.articles) {
        expect(a.title.length).toBeGreaterThan(0)
        expect(a.body.length).toBeGreaterThan(40)
      }
    }
  })

  it('discloses Fable 5 authorship in the standing byline', () => {
    expect(GAZETTE_BYLINE).toMatch(/Fable 5/)
    expect(GAZETTE_BYLINE).toMatch(/AI/i)
  })

  it('latestIssue returns the highest-numbered issue', () => {
    const latest = latestIssue()
    expect(latest.number).toBe(Math.max(...ISSUES.map((i) => i.number)))
  })
})
