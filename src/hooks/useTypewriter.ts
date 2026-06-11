import { useEffect, useRef, useState } from 'react'

/** Whether the user has asked the OS for reduced motion. */
function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

interface TypewriterOptions {
  /** Called as characters land — a soft typewriter tick. Never fires on skip
   *  or under reduced motion. */
  onTick?: () => void
  /** Fire onTick once per this many revealed characters. */
  tickEvery?: number
}

/**
 * Reveal `text` character-by-character. Returns the visible substring, whether
 * it has finished, and a `skip()` to reveal the whole string immediately.
 * Honors prefers-reduced-motion by showing the full text at once.
 */
export function useTypewriter(text: string, cps = 55, options?: TypewriterOptions) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0))
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  // refs so a new options object per render never restarts the animation
  const onTickRef = useRef(options?.onTick)
  const tickEveryRef = useRef(options?.tickEvery ?? 6)
  onTickRef.current = options?.onTick
  tickEveryRef.current = options?.tickEvery ?? 6

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(text.length)
      return
    }
    setCount(0)
    startRef.current = performance.now()
    let lastCount = 0
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000
      const target = Math.min(text.length, Math.floor(elapsed * cps))
      const every = Math.max(1, tickEveryRef.current)
      const crossings = Math.floor(target / every) - Math.floor(lastCount / every)
      for (let i = 0; i < crossings; i++) onTickRef.current?.()
      lastCount = target
      setCount(target)
      if (target < text.length) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [text, cps])

  const done = count >= text.length
  const skip = () => {
    // Cancel the in-flight frame FIRST — otherwise its queued setCount(target)
    // lands after ours and silently reverts the skip.
    cancelAnimationFrame(rafRef.current)
    setCount(text.length)
  }

  return { shown: text.slice(0, count), done, skip }
}
