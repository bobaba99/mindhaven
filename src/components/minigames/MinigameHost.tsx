import type { Building } from '../../data/types'
import { ReactionGame } from './ReactionGame'
import { MemoryGame } from './MemoryGame'
import { BellGame } from './BellGame'
import { LeverGame } from './LeverGame'
import { MaslowGame } from './MaslowGame'
import { KahnemanGame } from './KahnemanGame'
import { HookStub } from './HookStub'

interface MinigameHostProps {
  building: Building
  /** Called the first time the player meaningfully engages the hook. */
  onHookComplete: (buildingId: string) => void
}

/** Dispatch to the right interactive beat based on the building's hookKind. */
export function MinigameHost({ building, onHookComplete }: MinigameHostProps) {
  const success = () => onHookComplete(building.id)

  switch (building.hookKind) {
    case 'reaction-time':
      return <ReactionGame onSuccess={success} />
    case 'paired-memory':
      return <MemoryGame onSuccess={success} />
    case 'bell':
      return <BellGame onSuccess={success} />
    case 'lever':
      return <LeverGame onSuccess={success} />
    case 'maslow-stack':
      return <MaslowGame onSuccess={success} />
    case 'kahneman-snap':
      return <KahnemanGame onSuccess={success} />
    case 'stub':
    default:
      return <HookStub hookDescription={building.hookDescription} />
  }
}
