/**
 * Watson's Nursery — an ETHICAL re-do of stimulus pairing: a soft chime is
 * paired with a treat to condition CALM (never fear) in the petting-zoo
 * animals. Pure model; the component renders it.
 */
export interface WatsonState {
  /** How many chime+treat pairings have been performed. */
  pairings: number
  /** Strength of the chime→calm association, 0–100. */
  association: number
  /** How many times the chime alone has produced a calm response. */
  calmResponses: number
}

/** Association gained per gentle chime+treat pairing. */
export const PAIRING_GAIN = 25
/** Association needed before the chime alone soothes. */
export const CONDITIONING_THRESHOLD = 75

export function initialWatson(): WatsonState {
  return { pairings: 0, association: 0, calmResponses: 0 }
}

export function isConditioned(state: WatsonState): boolean {
  return state.association >= CONDITIONING_THRESHOLD
}

/** Pair the neutral chime with a pleasant treat — the kind way. */
export function pairStimuli(state: WatsonState): WatsonState {
  return {
    ...state,
    pairings: state.pairings + 1,
    association: Math.min(100, state.association + PAIRING_GAIN),
  }
}

/** Ring the chime with no treat: a calm response only once conditioned. */
export function chimeAlone(state: WatsonState): {
  state: WatsonState
  response: 'calm' | 'none'
} {
  if (!isConditioned(state)) {
    return { state, response: 'none' }
  }
  return {
    state: { ...state, calmResponses: state.calmResponses + 1 },
    response: 'calm',
  }
}
