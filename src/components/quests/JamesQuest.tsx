import { useEffect, useRef, useState } from 'react'
import {
  JAMES_SUMMARY,
  WISPS,
  allCaught,
  wispPosition,
} from '../../engine/quests/james'

interface JamesQuestProps {
  onSuccess: () => void
}

/**
 * James: three thought-wisps drift over the cobbles; click to catch each.
 * The instant a wisp is caught its text has already changed — the lesson.
 * With reduced motion preferred, the wisps float in place instead of drifting.
 */
export function JamesQuest({ onSuccess }: JamesQuestProps) {
  const [caught, setCaught] = useState<ReadonlySet<string>>(new Set())
  const [lastEcho, setLastEcho] = useState<string | null>(null)
  const [t, setT] = useState(0)
  const rewarded = useRef(false)

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Drift clock — pure function of elapsed time, so paused React trees
  // (unmounts, tab switches) never desync anything.
  useEffect(() => {
    if (reduceMotion) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      setT((now - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduceMotion])

  const done = allCaught(caught)

  useEffect(() => {
    if (done && !rewarded.current) {
      rewarded.current = true
      onSuccess()
    }
  }, [done, onSuccess])

  const catchWisp = (id: string, echo: string) => {
    if (caught.has(id)) return
    setCaught((prev) => new Set(prev).add(id))
    setLastEcho(echo)
  }

  return (
    <div className="mg">
      <p className="mg__hint">
        {done
          ? 'The stream flows on without its three glints.'
          : `Catch the drifting thoughts — ${caught.size}/${WISPS.length} held so far.`}
      </p>
      <div className="james-stream" role="group" aria-label="Drifting thought wisps">
        {WISPS.map((w, i) => {
          if (caught.has(w.id)) return null
          const pos = reduceMotion
            ? wispPosition(i, i * 4) // parked, but still distinct spots
            : wispPosition(i, t)
          return (
            <button
              key={w.id}
              className="wisp"
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
              onClick={() => catchWisp(w.id, w.echo)}
              aria-label={`Catch the thought: ${w.fragment}`}
            >
              ✨
            </button>
          )
        })}
        {caught.size === 0 && (
          <p className="james-stream__ripple" aria-hidden="true">
            〰 〰 〰
          </p>
        )}
      </div>
      {lastEcho && !done && (
        <div className="kahneman-explain">
          <p>{lastEcho}</p>
        </div>
      )}
      {done && (
        <div className="kahneman-explain">
          <p>{lastEcho}</p>
          <p className="mg__stat">🌊 {JAMES_SUMMARY}</p>
        </div>
      )}
    </div>
  )
}
