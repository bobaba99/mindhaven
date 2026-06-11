import { useRef, useState } from 'react'
import {
  GAZETTE_BYLINE,
  GAZETTE_MOTTO,
  ISSUES,
  latestIssue,
} from '../data/gazette'
import { useModalKeys } from '../hooks/useModalKeys'

interface GazettePanelProps {
  onClose: () => void
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Version updates, set in cozy newsprint. */
export function GazettePanel({ onClose }: GazettePanelProps) {
  const [issueNumber, setIssueNumber] = useState(() => latestIssue().number)
  const panelRef = useRef<HTMLDivElement>(null)
  useModalKeys(panelRef, onClose)

  const issue = ISSUES.find((i) => i.number === issueNumber) ?? latestIssue()

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="The Wundt Way Gazette">
      <div className="gazette pixel-panel" ref={panelRef}>
        <button className="dialogue__close" onClick={onClose} aria-label="Close the Gazette">
          ✕
        </button>

        <header className="gazette__masthead">
          <p className="gazette__ears">
            <span>Est. 1879</span>
            <span>Price: 2 ◆</span>
          </p>
          <h2 className="gazette__name">The Wundt Way Gazette</h2>
          <p className="gazette__motto">“{GAZETTE_MOTTO}”</p>
          <p className="gazette__dateline">
            No. {issue.number} · {formatDate(issue.date)} · {issue.version}
          </p>
        </header>

        <div className="gazette__body">
          <h3 className="gazette__headline">{issue.headline}</h3>
          <p className="gazette__subhead">{issue.subhead}</p>

          <div className="gazette__columns">
            {issue.articles.map((a) => (
              <article className="gazette__article" key={a.title}>
                {a.kicker && <p className="gazette__kicker">{a.kicker}</p>}
                <h4>{a.title}</h4>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
        </div>

        <footer className="gazette__foot">
          <span className="gazette__byline">{GAZETTE_BYLINE}</span>
          {ISSUES.length > 1 && (
            <span className="gazette__archive">
              {ISSUES.map((i) => (
                <button
                  key={i.number}
                  className={`gazette__issue-btn${i.number === issue.number ? ' is-active' : ''}`}
                  onClick={() => setIssueNumber(i.number)}
                  aria-label={`Read issue ${i.number}`}
                >
                  No. {i.number}
                </button>
              ))}
            </span>
          )}
        </footer>
      </div>
    </div>
  )
}
