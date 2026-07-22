/**
 * Townsfolk Tales — the five wanderers' teach-by-doing micro-quests.
 * This registry pairs each Townsperson (by id) with the framing text the
 * TownsfolkPanel shows; the playable logic lives in the sibling modules.
 */
export interface TownsfolkQuest {
  /** Matches the Townsperson id in data/buildings.ts. */
  id: string
  /** Short quest name shown as the activity tab / journal entry. */
  title: string
  /** One-line pitch shown under the greeting. */
  teaser: string
  /** In-character opening line (typewritten like a shop intro). */
  greeting: string
}

export const QUESTS: TownsfolkQuest[] = [
  {
    id: 'mary-ainsworth',
    title: 'A Reunion on the Street',
    teaser:
      'Watch three toddlers greet a returning caregiver — the reunion is where attachment shows itself.',
    greeting:
      "Hush — don't startle them. Three little ones on this street, and each of their caregivers stepped away for a moment. In my Strange Situation the *separation* tells you very little; it is the REUNION that speaks. Watch each child at the moment of return, and tell me what their greeting says.",
  },
  {
    id: 'leon-festinger',
    title: 'The Sour-Grapes Errand',
    teaser:
      'Walk the market run with Leon and flag every line that is dissonance talking, not fact.',
    greeting:
      "Ah, perfect timing — walk with me. I have just made a purchasing decision of unimpeachable rationality, and I intend to narrate it. Your job: listen closely, and call out every sentence where I am not describing the world but *repairing* it. When belief and behavior disagree, one of them quietly gets renovated.",
  },
  {
    id: 'william-james',
    title: 'Three Wisps of the Stream',
    teaser:
      'Catch three drifting thought-wisps — and notice that none of them holds still for you.',
    greeting:
      "See them? Little glints over the cobbles — thoughts, loose from somebody's stream. Wundt would pin them to a board and count their parts. I say a thought is like a river: dip your hand in and what you lift out is already not the river. Catch those three wisps for me, and mind what happens the instant you close your hand.",
  },
  {
    id: 'alfred-adler',
    title: 'Two Lonely Neighbors',
    teaser:
      'Two townsfolk eat lunch alone. Find the task that gives each of them a place to belong.',
    greeting:
      "You've noticed them too, then. Two neighbors, both eating alone, both quite sure they have nothing to offer. Nonsense. The deepest human striving is to belong and to contribute — what I call social interest. Don't introduce them; that's mere proximity. Find them a *task* that needs them both.",
  },
  {
    id: 'anna-freud',
    title: 'Cards by the Fountain',
    teaser:
      'Match each fountain-side scene to the defense mechanism at work in it.',
    greeting:
      "Father listened to adults on a couch; I watch children by fountains — their defenses are worn on the outside, like coats. I've sketched four little scenes from this very square onto cards. Match each scene to the defense at work in it. Be gentle in your judgments: a defense is not a flaw, it is the ego protecting someone as best it knows how.",
  },
]

const QUEST_BY_ID = new Map(QUESTS.map((q) => [q.id, q]))

export function questFor(townspersonId: string): TownsfolkQuest | undefined {
  return QUEST_BY_ID.get(townspersonId)
}
