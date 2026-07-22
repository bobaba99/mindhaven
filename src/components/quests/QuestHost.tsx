import { AinsworthQuest } from './AinsworthQuest'
import { FestingerQuest } from './FestingerQuest'
import { JamesQuest } from './JamesQuest'
import { AdlerQuest } from './AdlerQuest'
import { AnnaFreudQuest } from './AnnaFreudQuest'

interface QuestHostProps {
  townspersonId: string
  /** Called the first time the player completes the micro-quest. */
  onQuestComplete: (townspersonId: string) => void
}

/** Dispatch to the right townsfolk micro-quest by townsperson id. */
export function QuestHost({ townspersonId, onQuestComplete }: QuestHostProps) {
  const success = () => onQuestComplete(townspersonId)

  switch (townspersonId) {
    case 'mary-ainsworth':
      return <AinsworthQuest onSuccess={success} />
    case 'leon-festinger':
      return <FestingerQuest onSuccess={success} />
    case 'william-james':
      return <JamesQuest onSuccess={success} />
    case 'alfred-adler':
      return <AdlerQuest onSuccess={success} />
    case 'anna-freud':
      return <AnnaFreudQuest onSuccess={success} />
    default:
      return (
        <div className="mg mg--stub">
          <p>This wanderer has nowhere in particular to be — yet.</p>
        </div>
      )
  }
}
