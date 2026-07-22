interface InteractPromptProps {
  label: string
  locked: boolean
  /** 'enter' for shop doors, 'talk' for wandering townsfolk. */
  verb?: 'enter' | 'talk'
}

/** Floating "Press E" prompt at the bottom-center of the town view. It is a
 *  status hint (not interactive — key handling lives in the game input
 *  controller), so it is announced politely to assistive tech. */
export function InteractPrompt({ label, locked, verb = 'enter' }: InteractPromptProps) {
  return (
    <div
      className={`interact-prompt${locked ? ' interact-prompt--locked' : ''}`}
      role="status"
      aria-live="polite"
    >
      <kbd className="only-fine-pointer">E</kbd>
      <kbd className="only-coarse-pointer" aria-hidden="true">✦</kbd>
      <span>
        {locked ? 'Inspect (locked) ' : verb === 'talk' ? 'Talk to ' : 'Enter '}
        <strong>{label}</strong>
      </span>
    </div>
  )
}
