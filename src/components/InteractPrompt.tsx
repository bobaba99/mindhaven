interface InteractPromptProps {
  label: string
  locked: boolean
}

/** Floating "Press E" prompt at the bottom-center of the town view. It is a
 *  status hint (not interactive — key handling lives in the game input
 *  controller), so it is announced politely to assistive tech. */
export function InteractPrompt({ label, locked }: InteractPromptProps) {
  return (
    <div
      className={`interact-prompt${locked ? ' interact-prompt--locked' : ''}`}
      role="status"
      aria-live="polite"
    >
      <kbd>E</kbd>
      <span>
        {locked ? 'Inspect (locked) ' : 'Enter '}
        <strong>{label}</strong>
      </span>
    </div>
  )
}
