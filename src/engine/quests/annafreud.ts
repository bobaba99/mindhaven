/**
 * Anna Freud — defense-mechanism cards by the fountain. Four sketched scenes;
 * the player matches each to the defense at work. Mirrors the Freud dream
 * matcher's engine shape (rounds built with an injected shuffle).
 */
export interface DefenseCard {
  id: string
  /** The fountain-side scene sketched on the card. */
  scenario: string
  /** The defense mechanism the scene illustrates. */
  mechanism: string
  /** Anna's teaching note for the debrief. */
  note: string
}

export interface DefenseRound {
  card: DefenseCard
  options: string[]
}

export const DEFENSE_CARDS: DefenseCard[] = [
  {
    id: 'marbles',
    scenario:
      'A boy loses the marble game in front of everyone — and announces, quite calmly, that no game took place, and walks off whistling.',
    mechanism: 'Denial',
    note:
      'The loss is refused entry altogether. Denial is the bluntest defense — common and almost charming in children, costlier when adults keep using it.',
  },
  {
    id: 'brother',
    scenario:
      'A girl, furious that her brother got the bigger pastry, insists to everyone at the fountain that HE is the one who is angry and unbearable today.',
    mechanism: 'Projection',
    note:
      'Her anger is real but disowned — relocated into her brother, where it can be criticized safely. What we loudly condemn in others is worth a quiet look inward.',
  },
  {
    id: 'baby-talk',
    scenario:
      'The week the new baby arrived, six-year-old Nils — who has spoken beautifully for years — began asking for his milk in baby-talk again.',
    mechanism: 'Regression',
    note:
      'Under threat, the ego retreats to an older station on the line — one where care was guaranteed. It usually passes once the child feels safe again.',
  },
  {
    id: 'drums',
    scenario:
      'A girl who all summer wanted nothing more than to hit her cousin took up the drum instead — and by autumn is the best drummer on the street.',
    mechanism: 'Sublimation',
    note:
      'The impulse keeps its energy but changes address, arriving somewhere the world applauds. Father and I agreed on this much: sublimation is the most fortunate defense of all.',
  },
]

const CARD_BY_ID = new Map(DEFENSE_CARDS.map((c) => [c.id, c]))
const ALL_MECHANISMS = DEFENSE_CARDS.map((c) => c.mechanism)

export function isCorrectDefense(cardId: string, mechanism: string): boolean {
  return CARD_BY_ID.get(cardId)?.mechanism === mechanism
}

/** One round per card; options are all mechanisms, shuffled per round. */
export function buildDefenseRounds(
  shuffleFn: <T>(arr: T[]) => T[],
): DefenseRound[] {
  return shuffleFn(DEFENSE_CARDS).map((card) => ({
    card,
    options: shuffleFn(ALL_MECHANISMS),
  }))
}

export const ANNA_FREUD_SUMMARY =
  'Four scenes, four defenses — denial, projection, regression, sublimation. I catalogued these in 1936 not to accuse anyone but to read children accurately: every defense is the ego coping with more feeling than it can yet carry. Meet it with patience, not a pointed finger.'
