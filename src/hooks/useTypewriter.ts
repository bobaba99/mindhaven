import { useEffect, useRef, useState } from 'react'

/**
 * Reveal `text` character-by-character. Returns the visible substring, whether
 * it has finished, and a `skip()` to reveal the whole string immediately.
 */
export function useTypewriter(text: string, cps = 55) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    setCount(0)
    startRef.current = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000
      const target = Math.min(text.length, Math.floor(elapsed * cps))
      setCount(target)
      if (target < text.length) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [text, cps])

  const done = count >= text.length
  const skip = () => setCount(text.length)

  return { shown: text.slice(0, count), done, skip }
}
