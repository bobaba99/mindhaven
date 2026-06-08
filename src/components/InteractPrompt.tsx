interface InteractPromptProps {
  label: string
  locked: boolean
}

/** Floating "Press E" prompt at the bottom-center of the town view. */
export function InteractPrompt({ label, locked }: InteractPromptProps) {
  return (
    <div className={`interact-prompt${locked ? ' interact-prompt--locked' : ''}`}>
      <kbd>E</kbd>
      <span>
        {locked ? 'Inspect (locked) ' : 'Enter '}
        <strong>{label}</strong>
      </span>
    </div>
  )
}
