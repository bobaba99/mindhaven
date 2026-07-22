import type { Building } from '../../data/types'
import { ReactionGame } from './ReactionGame'
import { MemoryGame } from './MemoryGame'
import { BellGame } from './BellGame'
import { LeverGame } from './LeverGame'
import { WatsonGame } from './WatsonGame'
import { FreudGame } from './FreudGame'
import { JungGame } from './JungGame'
import { MaslowGame } from './MaslowGame'
import { RogersGame } from './RogersGame'
import { PiagetGame } from './PiagetGame'
import { BanduraGame } from './BanduraGame'
import { KahnemanGame } from './KahnemanGame'
import { LoftusGame } from './LoftusGame'
import { AschGame } from './AschGame'
import { EbbinghausGame } from './EbbinghausGame'
import { BartlettGame } from './BartlettGame'
import { SperlingGame } from './SperlingGame'
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
    case 'watson-pairing':
      return <WatsonGame onSuccess={success} />
    case 'freud-dreams':
      return <FreudGame onSuccess={success} />
    case 'jung-deck':
      return <JungGame onSuccess={success} />
    case 'maslow-stack':
      return <MaslowGame onSuccess={success} />
    case 'rogers-guestbook':
      return <RogersGame onSuccess={success} />
    case 'piaget-sort':
      return <PiagetGame onSuccess={success} />
    case 'bandura-model':
      return <BanduraGame onSuccess={success} />
    case 'kahneman-snap':
      return <KahnemanGame onSuccess={success} />
    case 'loftus-photo':
      return <LoftusGame onSuccess={success} />
    case 'asch-stage':
      return <AschGame onSuccess={success} />
    case 'ebbinghaus-recall':
      return <EbbinghausGame onSuccess={success} />
    case 'bartlett-swap':
      return <BartlettGame onSuccess={success} />
    case 'sperling-flash':
      return <SperlingGame onSuccess={success} />
    case 'stub':
    default:
      return <HookStub hookDescription={building.hookDescription} />
  }
}
