import { beforeEach, describe, expect, it } from 'vitest'
import {
  SETTINGS_STORAGE_KEY,
  cssVarsFor,
  defaultSettings,
  loadSettings,
  saveSettings,
} from './settings'

beforeEach(() => {
  localStorage.clear()
})

describe('settings defaults + persistence', () => {
  it('defaults to medium size and medium (readable) weight', () => {
    expect(defaultSettings()).toEqual({ textSize: 'medium', textWeight: 'medium' })
  })

  it('round-trips through localStorage', () => {
    saveSettings({ textSize: 'large', textWeight: 'bold' })
    expect(loadSettings()).toEqual({ textSize: 'large', textWeight: 'bold' })
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeTruthy()
  })

  it('falls back to defaults on corrupt or hostile storage', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, '{broken')
    expect(loadSettings()).toEqual(defaultSettings())
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ textSize: 'colossal', textWeight: 42 }),
    )
    expect(loadSettings()).toEqual(defaultSettings())
  })

  it('keeps valid fields and repairs invalid ones independently', () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ textSize: 'small', textWeight: 'nope' }),
    )
    expect(loadSettings()).toEqual({ textSize: 'small', textWeight: 'medium' })
  })
})

describe('cssVarsFor', () => {
  it('maps sizes to scale factors', () => {
    expect(cssVarsFor({ textSize: 'small', textWeight: 'regular' })['--text-scale']).toBe('0.9')
    expect(cssVarsFor({ textSize: 'medium', textWeight: 'regular' })['--text-scale']).toBe('1')
    expect(cssVarsFor({ textSize: 'large', textWeight: 'regular' })['--text-scale']).toBe('1.2')
  })

  it('maps weights to true font weights (medium = 500 with a hairline assist)', () => {
    const regular = cssVarsFor({ textSize: 'medium', textWeight: 'regular' })
    expect(regular['--body-weight']).toBe('400')
    expect(regular['--body-stroke']).toBe('0px')
    const medium = cssVarsFor({ textSize: 'medium', textWeight: 'medium' })
    expect(medium['--body-weight']).toBe('500')
    expect(parseFloat(medium['--body-stroke'])).toBeGreaterThan(0)
    expect(parseFloat(medium['--body-stroke'])).toBeLessThan(0.45)
    const bold = cssVarsFor({ textSize: 'medium', textWeight: 'bold' })
    expect(bold['--body-weight']).toBe('700')
    expect(bold['--body-stroke']).toBe('0px')
  })
})
