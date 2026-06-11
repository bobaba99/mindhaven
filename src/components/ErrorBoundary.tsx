import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Keys this app owns in localStorage (progress, settings). */
const APP_STORAGE_PREFIX = 'mindhaven.'

function clearAppStorage(): void {
  try {
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(APP_STORAGE_PREFIX)) doomed.push(key)
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    // storage unavailable — reload alone will have to do
  }
}

/**
 * Last-resort crash screen. Offers a plain reload and, if a corrupt save is
 * the culprit, a reset-save escape hatch so nobody is permanently bricked.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface for bug reports without shipping a logging dependency.
    console.error('Mindhaven crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="overlay" role="alertdialog" aria-label="Game error">
        <div className="pixel-panel crash-card">
          <h1>☁️ Wundt Way hit a pothole</h1>
          <p>
            Something went wrong inside the town. A reload usually fixes it —
            your progress is saved.
          </p>
          <div className="crash-card__actions">
            <button
              className="pixel-btn pixel-btn--primary"
              onClick={() => window.location.reload()}
            >
              Reload the town
            </button>
            <button
              className="pixel-btn"
              onClick={() => {
                clearAppStorage()
                window.location.reload()
              }}
            >
              Reset save &amp; reload
            </button>
          </div>
          <p className="crash-card__note">
            “Reset save” clears your Insight and unlocks — use it only if
            reloading alone keeps crashing.
          </p>
        </div>
      </div>
    )
  }
}
