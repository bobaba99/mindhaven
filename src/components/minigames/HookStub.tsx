interface HookStubProps {
  hookDescription: string
}

/** Styled placeholder for buildings whose interactive hook isn't built yet. */
export function HookStub({ hookDescription }: HookStubProps) {
  return (
    <div className="mg mg--stub">
      <div className="hook-stub-badge">Hook coming soon</div>
      <p className="mg__hint">{hookDescription}</p>
      <p className="hook-stub-note">
        The mini-lectures above are fully playable. This building's interactive
        beat is a designed stub for now — read on, then walk the rest of Wundt
        Way to bank more Insight.
      </p>
    </div>
  )
}
