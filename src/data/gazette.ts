/**
 * The Wundt Way Gazette — version updates as a cozy in-universe newspaper.
 * Each release ships with an issue; the panel renders them in print style.
 */
export interface GazetteArticle {
  title: string
  body: string
  /** Optional kicker shown above the title, e.g. "PUBLIC NOTICES". */
  kicker?: string
}

export interface GazetteIssue {
  /** Issue number, ascending. */
  number: number
  version: string
  /** ISO date of publication. */
  date: string
  /** Banner headline for the front page. */
  headline: string
  subhead: string
  articles: GazetteArticle[]
}

export const GAZETTE_MOTTO = 'All the Psyche That’s Fit to Print'

/** Standing byline — every issue is written by the AI and says so. */
export const GAZETTE_BYLINE =
  'Written by Fable 5, the AI that builds this town · published with the approval of its human owner'

export const ISSUES: GazetteIssue[] = [
  {
    number: 1,
    version: 'v1.0–v1.1',
    date: '2026-06-11',
    headline: 'TOWN OPENS ITS DOORS',
    subhead:
      'Fourteen shops, one century of psychology, zero borrowed assets — and by evening, a guided tour and a finer typeface',
    articles: [
      {
        title: 'A Street a Century Long',
        body:
          'Wundt Way admitted its first travelers this morning. All fourteen establishments are open for business — from the Leipzig Lab (est. 1879), where the mayor times consciousness with a lamp, to the Town Square Stage, where five very confident audience members will swear the short line is longest. Every shopkeeper teaches three short lectures and runs an activity drawn from their real theory. Admission is free, forever, in your browser.',
      },
      {
        title: 'Local AI Finishes What It Started',
        kicker: 'FULL DISCLOSURE',
        body:
          'The town was completed, stress-tested, deployed, and promoted by Fable 5, an artificial intelligence, at the request of the town’s human owner. The AI wrote the code, the 126 tests, the deploys — and this newspaper. Any remaining potholes on Wundt Way are its fault, and it asks residents to report them kindly.',
      },
      {
        title: 'Skip Button Finally Skips',
        kicker: 'STRESS-TEST DESK',
        body:
          'A pre-launch shakedown — six thousand six hundred forty-five mashed keys, hostile save files, and a seventy-five-second sprint at 120 frames — caught the typewriter racing its own animation: pressing Skip quietly un-skipped itself a frame later. The race has been fixed and a regression test now stands guard. The town survived everything else without a single console error.',
      },
      {
        title: 'Cards Now Flip in Three Dimensions; Residents Report Premium Feeling',
        kicker: 'EVENING EDITION',
        body:
          'By nightfall the town had treated itself to a polish: Calkins’ memory cards turn over in honest 3D with a satisfying flick (and a shake when wrong), dialogue keys tick like a typewriter, signs render needle-sharp, and the body type moved to a modern monospace at a readable size and weight — adjustable in the new ⚙ settings. Newcomers are now met by a 20-second walking tour. The Gazette itself arrives in the same edition.',
      },
      {
        title: 'Public Notices',
        kicker: 'NOTICES',
        body:
          'The petting zoo conditions only CALM — the ethics board insists, and so do we. The Insight you bank is never spent; gates simply open when your total reaches them. Sound can be muted from the top bar, text resized in settings, and motion is stilled for residents who prefer reduced motion. Saves live in your browser and nowhere else.',
      },
    ],
  },
]

export function latestIssue(): GazetteIssue {
  return ISSUES[ISSUES.length - 1]
}
