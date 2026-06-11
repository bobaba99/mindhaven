/**
 * Rogers' Warm Welcome Inn — guests confide something; the player picks a
 * response. Reflective (person-centered) listening earns regard; directive
 * advice and judgment do not. Pure model + content.
 */
export type ResponseKind = 'reflective' | 'directive' | 'judgmental'

export interface GuestOption {
  id: string
  text: string
  kind: ResponseKind
}

export interface GuestEntry {
  id: string
  name: string
  statement: string
  options: GuestOption[]
}

export interface RogersState {
  /** guestId -> the kind of response the player chose. */
  answered: Record<string, ResponseKind>
  /** Count of reflective responses given. */
  regard: number
}

export const GUESTS: GuestEntry[] = [
  {
    id: 'farmer',
    name: 'A tired farmer',
    statement:
      '“The harvest failed again. Everyone in town depends on me, and I feel like I’ve let every one of them down.”',
    options: [
      {
        id: 'farmer-reflect',
        text: '“It sounds crushing — like you carry the whole town’s hopes, and this year you feel you dropped them.”',
        kind: 'reflective',
      },
      {
        id: 'farmer-direct',
        text: '“You should plant hardier crops and diversify next season. Problem solved.”',
        kind: 'directive',
      },
      {
        id: 'farmer-judge',
        text: '“Honestly, you probably sowed too late. That one’s on you.”',
        kind: 'judgmental',
      },
    ],
  },
  {
    id: 'clerk',
    name: 'A new town clerk',
    statement:
      '“I finally got the post I wanted… and now I lie awake certain they’ll discover I’m a fraud.”',
    options: [
      {
        id: 'clerk-direct',
        text: '“Just make a list of your qualifications and read it every morning.”',
        kind: 'directive',
      },
      {
        id: 'clerk-reflect',
        text: '“Even with the win in hand, there’s a voice inside insisting you didn’t earn it.”',
        kind: 'reflective',
      },
      {
        id: 'clerk-judge',
        text: '“If you really felt like a fraud, maybe you shouldn’t have taken the job.”',
        kind: 'judgmental',
      },
    ],
  },
  {
    id: 'sibling',
    name: 'A weathered fisher',
    statement:
      '“My brother and I haven’t spoken in a year. I don’t even remember how it started — only that I don’t know how to end it.”',
    options: [
      {
        id: 'sibling-judge',
        text: '“A whole year? One of you has to be the bigger person, clearly.”',
        kind: 'judgmental',
      },
      {
        id: 'sibling-direct',
        text: '“Write him a letter tonight. Keep it short. Done.”',
        kind: 'directive',
      },
      {
        id: 'sibling-reflect',
        text: '“The silence has outlived the quarrel — and now the silence itself is the hardest thing to cross.”',
        kind: 'reflective',
      },
    ],
  },
  {
    id: 'widow',
    name: 'A quiet weaver',
    statement:
      '“It’s been two winters since I lost her. Everyone keeps telling me I should be over it by now.”',
    options: [
      {
        id: 'widow-reflect',
        text: '“Their clock isn’t your clock — and being told to be ‘over it’ leaves you alone with it.”',
        kind: 'reflective',
      },
      {
        id: 'widow-direct',
        text: '“Have you tried keeping busy? Take up a hobby; it works wonders.”',
        kind: 'directive',
      },
      {
        id: 'widow-judge',
        text: '“Two winters is a long time. They may have a point.”',
        kind: 'judgmental',
      },
    ],
  },
]

/** Reflective responses needed for the inn to feel truly warm. */
export const REGARD_TO_SUCCEED = 3

export function initialRogers(): RogersState {
  return { answered: {}, regard: 0 }
}

export function respond(
  state: RogersState,
  guestId: string,
  optionId: string,
): RogersState {
  if (guestId in state.answered) return state
  const guest = GUESTS.find((g) => g.id === guestId)
  const option = guest?.options.find((o) => o.id === optionId)
  if (!guest || !option) return state
  return {
    answered: { ...state.answered, [guestId]: option.kind },
    regard: state.regard + (option.kind === 'reflective' ? 1 : 0),
  }
}

export function isWarmWelcome(state: RogersState): boolean {
  return state.regard >= REGARD_TO_SUCCEED
}

/** Teaching beat shown after each choice. */
export function explainFor(kind: ResponseKind): string {
  switch (kind) {
    case 'reflective':
      return (
        'You reflected the feeling back without fixing or judging — empathy, ' +
        'unconditional positive regard, and congruence. The guest hears themself, ' +
        'and that is where change starts.'
      )
    case 'directive':
      return (
        'Advice puts you in the expert’s chair. Rogers would gently object: the ' +
        'client is the expert on their own life — direction crowds out their own voice.'
      )
    case 'judgmental':
      return (
        'Judgment attaches conditions to your regard. The guest now performs for ' +
        'your approval instead of exploring honestly — the opposite of a safe climate.'
      )
  }
}
