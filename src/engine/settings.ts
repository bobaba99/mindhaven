/**
 * Player-adjustable reading settings (text size + weight), persisted to
 * localStorage and applied as CSS custom properties on the app root.
 *
 * Weight note: body copy uses a modern system-monospace stack (--font-body);
 * "medium" asks for a real 500 face and adds a hairline stroke so stacks
 * without one (Menlo, Courier fallback) still thicken — no webfont shipped.
 */
export type TextSize = 'small' | 'medium' | 'large'
export type TextWeight = 'regular' | 'medium' | 'bold'

export interface GameSettings {
  textSize: TextSize
  textWeight: TextWeight
}

export const SETTINGS_STORAGE_KEY = 'mindhaven.settings.v1'

const TEXT_SIZES: readonly TextSize[] = ['small', 'medium', 'large']
const TEXT_WEIGHTS: readonly TextWeight[] = ['regular', 'medium', 'bold']

export function defaultSettings(): GameSettings {
  return { textSize: 'medium', textWeight: 'medium' }
}

function isTextSize(v: unknown): v is TextSize {
  return typeof v === 'string' && (TEXT_SIZES as readonly string[]).includes(v)
}

function isTextWeight(v: unknown): v is TextWeight {
  return typeof v === 'string' && (TEXT_WEIGHTS as readonly string[]).includes(v)
}

export function loadSettings(): GameSettings {
  const base = defaultSettings()
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return base
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return base
    const obj = parsed as Record<string, unknown>
    return {
      textSize: isTextSize(obj.textSize) ? obj.textSize : base.textSize,
      textWeight: isTextWeight(obj.textWeight) ? obj.textWeight : base.textWeight,
    }
  } catch {
    return base
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // storage unavailable — settings just won't persist
  }
}

const SCALE_BY_SIZE: Record<TextSize, string> = {
  small: '0.9',
  medium: '1',
  large: '1.2',
}

const WEIGHT_BY_KIND: Record<TextWeight, { weight: string; stroke: string }> = {
  regular: { weight: '400', stroke: '0px' },
  // True 500 where the stack has it (SF Mono, Consolas variants); the hairline
  // stroke quietly covers faces that lack a medium (Menlo, Courier fallback).
  medium: { weight: '500', stroke: '0.25px' },
  bold: { weight: '700', stroke: '0px' },
}

/** CSS custom properties the stylesheet reads for reading-text surfaces. */
export function cssVarsFor(settings: GameSettings): Record<string, string> {
  const w = WEIGHT_BY_KIND[settings.textWeight]
  return {
    '--text-scale': SCALE_BY_SIZE[settings.textSize],
    '--body-weight': w.weight,
    '--body-stroke': w.stroke,
  }
}
