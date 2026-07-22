import type { Building, Townsperson } from './types'

/**
 * The 14 buildings of Wundt Way, west -> east, roughly chronological.
 * Content faithful to `Town design.md`. Lecture blurbs are written in each
 * NPC's voice and kept accurate + concise (2-4 sentences).
 */
export const BUILDINGS: Building[] = [
  {
    order: 1,
    id: 'leipzig-lab',
    name: 'The Leipzig Lab & Town Hall',
    figure: 'Wilhelm Wundt',
    dates: '1832–1920',
    school: 'Structuralism / experimental',
    stardewAnalog: "Mayor's manor / town hall + clock tower",
    intro:
      "Welcome to Wundt Way, traveler! Right here, in 1879, I opened the very first room where the mind was measured instead of merely mused upon. Pull up a chair — when the lamp flashes, tell me the *instant* you saw it. We are timing consciousness itself.",
    hookDescription:
      'Tap the reaction-time clock when the lamp flashes; calmer, faster readings earn Insight.',
    hookKind: 'reaction-time',
    unlockCost: 0,
    palette: {
      wall: '#d9c7a3', wallDark: '#b7a079', roof: '#7a5a3a', roofDark: '#5d432b',
      door: '#4a3520', accent: '#c9a24b',
    },
    lectures: [
      {
        id: 'wundt-1879',
        title: '1879: The Year Psychology Got a Lab Coat',
        blurb:
          "Before me, the mind belonged to the philosophers. In 1879 I gave it a laboratory in Leipzig — apparatus, trained observers, and a method. That single room is why we now date psychology's birth as a science to that year.",
      },
      {
        id: 'wundt-introspection',
        title: 'Introspection: Reporting the Building Blocks of Experience',
        blurb:
          "My observers were rigorously trained to report the raw elements of a conscious experience — a sensation's quality, intensity, duration. We were not asking how you *feel* loosely; we were dissecting consciousness into its structures. Critics later doubted the method, but it gave the field its first systematic data.",
      },
      {
        id: 'wundt-reaction',
        title: 'Why Reaction Time Made the Mind Measurable',
        blurb:
          "Thought is invisible — but the time it takes is not. By measuring how long it takes to react, and how that time grows when I add a mental step, I could put a number on a moment of mind. Reaction time turned the inner world into something a clock could read.",
      },
    ],
  },
  {
    order: 2,
    id: 'calkins-reading-room',
    name: "Calkins' Reading Room",
    figure: 'Mary Whiton Calkins',
    dates: '1863–1930',
    school: 'Self-psychology, memory',
    stardewAnalog: 'Library',
    intro:
      "They let me complete every requirement at Harvard but withheld the degree because I am a woman — so I built my own laboratory at Wellesley instead. In 1905 I became the first woman to preside over the APA. Sit; I'll teach you to remember in *pairs*.",
    hookDescription:
      'A paired-associate matching card game; clearing rounds unlocks a memory journal you carry between shops.',
    hookKind: 'paired-memory',
    unlockCost: 0,
    palette: {
      wall: '#cdb89a', wallDark: '#a89376', roof: '#6b7d8a', roofDark: '#4e5d68',
      door: '#3a2f24', accent: '#8aa6b8',
    },
    lectures: [
      {
        id: 'calkins-paired',
        title: 'Paired-Associate Learning: How We Built Memory Science',
        blurb:
          "I invented the paired-associate technique: show two items together, then test whether one calls up the other. It let me measure how vividness, frequency, and recency shape what we retain. The method outlived its quarrels and still anchors memory research today.",
      },
      {
        id: 'calkins-self',
        title: 'The Self as the Center of Psychology',
        blurb:
          "I came to believe psychology cannot be a science of disconnected sensations — it must be a science of the *self* that has them. Every experience is some self's experience, related to its objects. That conscious, relating self was the throughline of my work.",
      },
      {
        id: 'calkins-ceiling',
        title: 'Breaking the Ceiling: Women in Early Psychology',
        blurb:
          "Harvard's faculty judged my dissertation among the best they had seen, yet the degree never came. I pressed on, founded a laboratory, and in 1905 led the American Psychological Association. The science was open to me even when the institutions were not.",
      },
    ],
  },
  {
    order: 3,
    id: 'pavlov-provisions',
    name: "Pavlov's Provisions (Ring the Bell)",
    figure: 'Ivan Pavlov',
    dates: '1849–1936',
    school: 'Classical conditioning',
    stardewAnalog: "Pierre's General Store",
    intro:
      "Hear that? *Ding.* You just felt a little hungry, didn't you? My dogs taught me that a neutral sound, paired enough with dinner, becomes a promise the body can't ignore. Step in — every time the bell rings, the shelves restock.",
    hookDescription:
      'Ring the bell to trigger a conditioned restock; over-ring and you watch extinction set in.',
    hookKind: 'bell',
    unlockCost: 6,
    palette: {
      wall: '#c98f6a', wallDark: '#a26e4f', roof: '#3f6b4a', roofDark: '#2d4f36',
      door: '#5a3a22', accent: '#e0c060',
    },
    lectures: [
      {
        id: 'pavlov-uncs',
        title: 'Unconditioned vs. Conditioned: The Anatomy of a Reflex',
        blurb:
          "Food in the mouth makes a dog salivate with no learning at all — that is the unconditioned reflex. Pair a bell with that food often enough, and the bell alone will do it. The once-neutral sound becomes a conditioned stimulus, and salivation to it a conditioned response.",
      },
      {
        id: 'pavlov-extinction',
        title: 'Acquisition, Extinction, and Spontaneous Recovery',
        blurb:
          "Learning the link is *acquisition*. Ring the bell again and again with no food, and the response fades — that is *extinction*. Yet wait a while and the response can reappear on its own: *spontaneous recovery*. The body unlearns slowly, and never quite forgets.",
      },
      {
        id: 'pavlov-cravings',
        title: 'From Salivating Dogs to Everyday Cravings',
        blurb:
          "What works in my laboratory works in your life. The ping of your phone, the smell of a bakery, a song tied to a memory — each is a bell that someone, or something, paired with reward. Once you see conditioning, you see it everywhere.",
      },
    ],
  },
  {
    order: 4,
    id: 'skinner-arcade',
    name: 'The Skinner Box Arcade',
    figure: 'B. F. Skinner',
    dates: '1904–1990',
    school: 'Operant conditioning / behaviorism',
    stardewAnalog: 'Saloon / arcade machines',
    intro:
      "Forget what's *inside* the head for a moment — watch what behavior *does*. Press this lever. Sometimes you get a reward right away, sometimes you have to wait. The *schedule* is the whole trick, and it's why you can't put the machine down.",
    hookDescription:
      'Lever-press arcade cabinets demonstrating fixed vs. variable reinforcement schedules.',
    hookKind: 'lever',
    unlockCost: 12,
    palette: {
      wall: '#b58a5a', wallDark: '#8f6a41', roof: '#7a3b3b', roofDark: '#5c2c2c',
      door: '#3a261a', accent: '#e8b84b',
    },
    lectures: [
      {
        id: 'skinner-reinforce',
        title: "Reinforcement vs. Punishment (They're Not Opposites)",
        blurb:
          "Reinforcement makes a behavior more likely; punishment makes it less likely. Each can be *positive* (adding something) or *negative* (removing something) — so negative reinforcement is not punishment, it is relief that strengthens a behavior. Confuse these and you will train the opposite of what you intend.",
      },
      {
        id: 'skinner-schedules',
        title: 'Schedules of Reinforcement: Why Slot Machines Work',
        blurb:
          "Reward every press and the behavior is brisk but fragile. Reward on a *variable ratio* — every few presses, but you never know which — and the behavior becomes nearly impossible to extinguish. That unpredictable payoff is exactly what a slot machine sells.",
      },
      {
        id: 'skinner-shaping',
        title: 'Shaping: Building Big Behaviors From Small Steps',
        blurb:
          "You cannot reward a pigeon for a trick it has never done. So I reward each small step toward it — a turn, a lean, a peck — successively closer to the goal. By reinforcing successive approximations, I can shape behavior far more complex than any single reward could teach.",
      },
    ],
  },
  {
    order: 5,
    id: 'watson-nursery',
    name: "Watson & Little Albert's Nursery",
    figure: 'John B. Watson',
    dates: '1878–1958',
    school: 'Behaviorism (methodological)',
    stardewAnalog: "Marnie's Ranch / animal pen",
    intro:
      "Give me a dozen healthy infants, I once boasted, and I'll shape any one of them into anything. Bold words — and the Little Albert study is a cautionary tale we tell honestly here. Come meet the animals; we'll learn stimulus and response the *kind* way.",
    hookDescription:
      'A gentle petting zoo: pair a soft chime with treats until the chime alone calms the animals — an ethical re-do of the original study.',
    hookKind: 'watson-pairing',
    unlockCost: 18,
    palette: {
      wall: '#cdb88e', wallDark: '#a8946d', roof: '#6e8a4a', roofDark: '#516836',
      door: '#4a3422', accent: '#d8c060',
    },
    lectures: [
      {
        id: 'watson-manifesto',
        title: 'Behaviorism’s Manifesto: Psychology as Pure Observation',
        blurb:
          "In 1913 I declared that psychology should drop the unobservable mind entirely and study only what can be seen: stimulus and response. No introspection, no consciousness — just behavior, predicted and controlled. It was a radical narrowing, and it set the agenda for decades.",
      },
      {
        id: 'watson-albert',
        title: 'The Little Albert Study — and the Ethics We Learned From It',
        blurb:
          "We conditioned an infant to fear a white rat by pairing it with a frightening noise, and the fear spread to other furry things. The boy was never deconditioned. Today we tell this study as a warning: it would never pass an ethics board, and that is precisely the lesson.",
      },
      {
        id: 'watson-nurture',
        title: "Nature vs. Nurture, Watson’s Extreme Bet",
        blurb:
          "I wagered that environment is everything — that I could take any healthy infant and train them into doctor, lawyer, or thief regardless of their gifts. It was an overstatement, and I knew it. But it forced the field to take nurture seriously as a measurable force.",
      },
    ],
  },
  {
    order: 6,
    id: 'freud-couch',
    name: "Freud's Couch & Dream Apothecary",
    figure: 'Sigmund Freud',
    dates: '1856–1939',
    school: 'Psychoanalysis',
    stardewAnalog: "Clinic / Harvey's pharmacy",
    intro:
      "Lie back. Tell me whatever drifts in, however absurd — *especially* if it embarrasses you. The mind keeps a cellar, and at night its contents come up the stairs in costume. Bring me your dreams; I'll help you read the labels.",
    hookDescription:
      "Nap on the couch, then read each dream's manifest content for the latent wish beneath (historical theory, not clinical fact).",
    hookKind: 'freud-dreams',
    unlockCost: 24,
    palette: {
      wall: '#b9a7c2', wallDark: '#94849c', roof: '#4a3d5e', roofDark: '#352c44',
      door: '#2e2438', accent: '#c8a24b',
    },
    lectures: [
      {
        id: 'freud-structure',
        title: "Id, Ego, Superego: The Mind's Three Roommates",
        blurb:
          "The *id* wants everything now; the *superego* is the stern voice of conscience and rules; the *ego* is the harried negotiator brokering peace between them and reality. Much of our inner conflict, I argued, is this three-way quarrel playing out beneath awareness.",
      },
      {
        id: 'freud-unconscious',
        title: 'The Unconscious and Why Slips Slip',
        blurb:
          "Most of the mind, like an iceberg, lies below the surface. The wishes we repress do not vanish — they leak out in slips of the tongue, in jokes, in the things we 'accidentally' forget. To me, no slip is truly an accident.",
      },
      {
        id: 'freud-dreams',
        title: 'Dream Work: Manifest vs. Latent Content',
        blurb:
          "A dream's *manifest* content is the strange story you remember; its *latent* content is the hidden wish underneath. Between them sits the dream-work — condensing, displacing, disguising — that smuggles the forbidden wish past the censor. I called dreams the royal road to the unconscious.",
      },
    ],
  },
  {
    order: 7,
    id: 'jung-emporium',
    name: "Jung's Archetype Emporium",
    figure: 'Carl Jung',
    dates: '1875–1961',
    school: 'Analytical psychology',
    stardewAnalog: 'Fortune teller / curiosity shop',
    intro:
      "Freud and I parted ways, you know — he saw the basement, I looked at the *foundations* we all share. The Shadow, the Anima, the Wise Old One: these are not yours alone, they are humanity's furniture. Draw a card; meet a piece of yourself.",
    hookDescription:
      'Draw archetype cards from the collective deck and swap toward balance; a whole hand reveals a playful, non-diagnostic motif.',
    hookKind: 'jung-deck',
    unlockCost: 30,
    palette: {
      wall: '#a9b8c6', wallDark: '#86949f', roof: '#3d5a6b', roofDark: '#2c424f',
      door: '#2a3640', accent: '#d8b24b',
    },
    lectures: [
      {
        id: 'jung-collective',
        title: 'The Collective Unconscious & Archetypes',
        blurb:
          "Beneath your personal memories lies a deeper layer we all inherit: the collective unconscious, stocked with *archetypes* — the Mother, the Hero, the Shadow. These are not images but predispositions, ancient patterns that shape the myths and dreams of every culture.",
      },
      {
        id: 'jung-types',
        title: 'Introversion and Extraversion (Yes, He Coined Them)',
        blurb:
          "I named the two great attitudes of the psyche: the introvert, whose energy turns inward toward reflection, and the extravert, whose energy flows outward toward the world. Neither is better — they are different orientations of the same vital force, and most of us blend them.",
      },
      {
        id: 'jung-shadow',
        title: 'The Shadow: Befriending What You Hide',
        blurb:
          "The Shadow is everything about yourself you would rather not own — pushed out of sight but never gone. Deny it and it rules you from the dark, often projected onto others. The work of a whole life is to turn and face it, and make it an ally.",
      },
    ],
  },
  {
    order: 8,
    id: 'maslow-bakery',
    name: "Maslow's Pyramid Bakery",
    figure: 'Abraham Maslow',
    dates: '1908–1970',
    school: 'Humanistic',
    stardewAnalog: 'Stardrop Saloon kitchen / bakery',
    intro:
      "You can't frost the top of a cake that has no base. Hunger and safety come first, then love, then esteem — and only when those are steady do we reach for the sweetest tier: becoming everything we could be. Help me build today's pyramid, bottom up.",
    hookDescription:
      'Stack a tiered needs-cake in the right order — skip a layer and it topples.',
    hookKind: 'maslow-stack',
    unlockCost: 36,
    palette: {
      wall: '#e6c79a', wallDark: '#c4a576', roof: '#c47a3a', roofDark: '#9c5d2a',
      door: '#5a3a22', accent: '#f0d060',
    },
    lectures: [
      {
        id: 'maslow-hierarchy',
        title: 'The Hierarchy of Needs, One Tier at a Time',
        blurb:
          "I pictured human motivation as tiers: physiological needs at the base, then safety, then love and belonging, then esteem, and self-actualization at the peak. The idea is that lower needs press most urgently when unmet, freeing us for higher ones once they are reasonably satisfied.",
      },
      {
        id: 'maslow-actualization',
        title: 'Self-Actualization & Peak Experiences',
        blurb:
          "At the summit sits self-actualization — becoming the fullest version of yourself, whatever your gift demands. Along the way come *peak experiences*: moments of awe, absorption, and wholeness. I studied not the sick but the exceptionally well, asking what thriving looks like.",
      },
      {
        id: 'maslow-pyramid',
        title: 'Was the Pyramid Even a Pyramid? (Maslow’s Real Words)',
        blurb:
          "Here is a confession: I never drew a pyramid. That triangle came from textbooks after me. I also wrote that the levels are not rigid steps — they overlap, and a person can pursue higher needs before lower ones are perfectly met. Beware the tidy diagram that simplifies a living idea.",
      },
    ],
  },
  {
    order: 9,
    id: 'rogers-inn',
    name: "Rogers' Warm Welcome Inn",
    figure: 'Carl Rogers',
    dates: '1902–1987',
    school: 'Humanistic / person-centered',
    stardewAnalog: 'Inn / community center hub',
    intro:
      "However you arrived today — tired, proud, ashamed — you are welcome here exactly as you are. I won't fix you; I'll *listen* until you hear yourself. That's the whole therapy: warmth, honesty, and no conditions on my regard for you.",
    hookDescription:
      'Greet guests at the regard guestbook and pick the response that truly listens — reflection over advice or judgment.',
    hookKind: 'rogers-guestbook',
    unlockCost: 42,
    palette: {
      wall: '#e2cf9c', wallDark: '#c2ad77', roof: '#5a8a6a', roofDark: '#426650',
      door: '#4a3422', accent: '#e8c860',
    },
    lectures: [
      {
        id: 'rogers-core',
        title: 'Unconditional Positive Regard, Empathy, Congruence',
        blurb:
          "I found that real change needs three conditions from the helper: *unconditional positive regard* (acceptance with no strings), *empathy* (truly grasping the other's world), and *congruence* (being genuine rather than playing a role). Offer these reliably and people heal themselves.",
      },
      {
        id: 'rogers-pct',
        title: 'Person-Centered Therapy: The Client Leads',
        blurb:
          "I stopped calling them patients and called them clients, because the expert on a life is the person living it. The therapist does not diagnose and direct; they create a safe climate in which the client finds their own way forward. The client leads; I follow.",
      },
      {
        id: 'rogers-self',
        title: "The Self-Concept and the 'Fully Functioning Person'",
        blurb:
          "Distress often grows from a gap between who you are and the self you believe you must be to earn love. Close that gap and you move toward the *fully functioning person*: open to experience, trusting your own judgment, and free to keep becoming.",
      },
    ],
  },
  {
    order: 10,
    id: 'piaget-schoolhouse',
    name: "Piaget's Schoolhouse",
    figure: 'Jean Piaget',
    dates: '1896–1980',
    school: 'Developmental / cognitive',
    stardewAnalog: 'Schoolhouse',
    intro:
      "Children are not tiny adults — they think in *stages*, each with its own logic. Show a small one two equal glasses, pour one into a taller cup, and they'll swear it grew. Marvelous! Come, let's sort the world the way a growing mind does.",
    hookDescription:
      'Sort what each child is doing onto the right developmental stage — conservation slips, pretend horses, and all.',
    hookKind: 'piaget-sort',
    unlockCost: 48,
    palette: {
      wall: '#d6c08a', wallDark: '#b4a06d', roof: '#b5662f', roofDark: '#8c4e23',
      door: '#4a3422', accent: '#e0b84b',
    },
    lectures: [
      {
        id: 'piaget-stages',
        title: 'The Four Stages: Sensorimotor to Formal Operational',
        blurb:
          "Thinking matures in four stages: *sensorimotor* (knowing the world through action), *preoperational* (symbols, but shaky logic), *concrete operational* (logic about real things), and *formal operational* (abstract, hypothetical reasoning). Each stage is a new pair of glasses for seeing reality.",
      },
      {
        id: 'piaget-schemas',
        title: 'Assimilation & Accommodation: How Schemas Grow',
        blurb:
          "A child meets the world with mental templates called *schemas*. New experiences are either *assimilated* — fitted into an existing schema — or, when they won't fit, the schema *accommodates* and changes shape. Learning is this constant back-and-forth toward balance.",
      },
      {
        id: 'piaget-conservation',
        title: 'Conservation and the Famous Water-Glass Trick',
        blurb:
          "Pour water from a wide glass into a tall thin one and a young child insists there is now *more* — fooled by height. *Conservation* is the later insight that quantity stays the same despite changes in appearance. Watching when a child grasps it reveals the very machinery of thought.",
      },
    ],
  },
  {
    order: 11,
    id: 'bandura-gym',
    name: "Bandura's Bobo Gym",
    figure: 'Albert Bandura',
    dates: '1925–2021',
    school: 'Social-cognitive',
    stardewAnalog: 'Blacksmith / training yard',
    intro:
      "You don't have to be rewarded to learn — you can just *watch*. My famous inflatable doll showed how children copy what they see, aggression and all. In here, you'll learn by modeling: attend, remember, reproduce, and stay motivated.",
    hookDescription:
      "Watch the trainer's combo, then reproduce it from memory (modeling), building self-efficacy XP.",
    hookKind: 'bandura-model',
    unlockCost: 54,
    palette: {
      wall: '#bfa98a', wallDark: '#9b8769', roof: '#6a6a72', roofDark: '#4d4d54',
      door: '#33291f', accent: '#d8a84b',
    },
    lectures: [
      {
        id: 'bandura-bobo',
        title: 'Observational Learning & the Bobo Doll Study',
        blurb:
          "Children who watched an adult punch an inflatable Bobo doll later punched it themselves, copying the very acts they had seen. They learned aggression without ever being rewarded for it — simply by observing. Learning, I showed, can happen through the eyes alone.",
      },
      {
        id: 'bandura-efficacy',
        title: 'Self-Efficacy: Believing You Can',
        blurb:
          "*Self-efficacy* is your belief in your own ability to handle a given task. It is not vague self-esteem — it is task-specific confidence, and it powerfully predicts whether you try, persist, and recover from setbacks. Belief in capability becomes a cause of capability.",
      },
      {
        id: 'bandura-reciprocal',
        title: 'Reciprocal Determinism: Person, Behavior, Environment',
        blurb:
          "You are neither a puppet of your environment nor wholly its master. Person, behavior, and environment each shape the other two in a constant loop — *reciprocal determinism*. You act on the world that is acting on you, and so you help author your own circumstances.",
      },
    ],
  },
  {
    order: 12,
    id: 'kahneman-diner',
    name: "Kahneman & Tversky's Two-Speed Diner",
    figure: 'Daniel Kahneman & Amos Tversky',
    dates: '1934–2024 / 1937–1996',
    school: 'Behavioral / cognitive',
    stardewAnalog: 'Diner / fast-food counter',
    intro:
      "Two counters, one diner. The fast lane is your gut — quick, intuitive, and *gloriously* wrong sometimes. The slow booth is effortful thinking. Most folks live at the fast counter and pay for it with a side of bias. Order carefully.",
    hookDescription:
      'Snap-judgment puzzles at the fast counter (you fall for the bias), then correct it at the slow booth.',
    hookKind: 'kahneman-snap',
    unlockCost: 60,
    palette: {
      wall: '#c9b07a', wallDark: '#a7905d', roof: '#a83b3b', roofDark: '#7e2c2c',
      door: '#3a2a1a', accent: '#e8d04b',
    },
    lectures: [
      {
        id: 'kahneman-systems',
        title: 'System 1 & System 2: Fast and Slow Thinking',
        blurb:
          "*System 1* is fast, automatic, and effortless — it jumps to conclusions and is usually right enough. *System 2* is slow, deliberate, and lazy; it would rather endorse System 1's guess than do the work. Knowing which system is steering is the start of thinking well.",
      },
      {
        id: 'kahneman-heuristics',
        title: 'Anchoring, Availability, and Representativeness',
        blurb:
          "We lean on mental shortcuts. *Anchoring*: a first number drags our estimate toward it. *Availability*: vivid, easily recalled events feel more common than they are. *Representativeness*: we judge by resemblance to a stereotype and ignore the base rates. Handy shortcuts, predictable errors.",
      },
      {
        id: 'kahneman-prospect',
        title: 'Prospect Theory: Why Losses Loom Larger',
        blurb:
          "Amos and I found that people do not weigh gains and losses evenly — a loss hurts about twice as much as an equal gain pleases. So we take risks to avoid losses we would never take to chase gains. (When the 2002 Nobel came, Amos had died; the prize is never given posthumously.)",
      },
    ],
  },
  {
    order: 13,
    id: 'loftus-studio',
    name: "Loftus' Lost-&-Found Photo Studio",
    figure: 'Elizabeth Loftus',
    dates: 'b. 1944',
    school: 'Cognitive / memory',
    stardewAnalog: 'Photo shop / museum annex',
    intro:
      "Memory isn't a recording — it's a reconstruction, and I can prove it. Tell me how fast the cars were going when they *smashed*... or did they merely *contact*? Watch your memory bend to my question. Step into the darkroom; let's develop what really happened.",
    hookDescription:
      'Witness a street scene, then answer an interview whose leading questions quietly rewrite your photo.',
    hookKind: 'loftus-photo',
    unlockCost: 66,
    palette: {
      wall: '#b6a9a0', wallDark: '#928680', roof: '#5a4a5a', roofDark: '#423644',
      door: '#2e2630', accent: '#d8b84b',
    },
    lectures: [
      {
        id: 'loftus-misinfo',
        title: 'The Misinformation Effect & the Car-Crash Study',
        blurb:
          "I showed people a filmed collision, then asked how fast the cars went when they 'smashed' versus 'hit.' The word 'smashed' produced higher speed estimates — and a week later, those viewers were more likely to 'remember' broken glass that was never there. The question reshaped the memory.",
      },
      {
        id: 'loftus-leading',
        title: 'How Leading Questions Rewrite Memory',
        blurb:
          "A single suggestive word can plant detail that the mind quietly adopts as its own recollection. Memory is not retrieved intact from storage; it is rebuilt each time, and whatever is in the air during that rebuild can be woven in. This is why how we ask matters as much as what we ask.",
      },
      {
        id: 'loftus-false',
        title: 'False Memories and Why Eyewitnesses Falter',
        blurb:
          "I have implanted whole events that never happened — a childhood of being lost in a mall — in a sizeable share of people, vividly and with confidence. That is why eyewitness testimony, however sincere, can convict the innocent. Confidence is not the same thing as accuracy.",
      },
    ],
  },
  {
    order: 14,
    id: 'asch-milgram-stage',
    name: "Asch & Milgram's Town Square Stage",
    figure: 'Solomon Asch & Stanley Milgram',
    dates: '1907–1996 / 1933–1984',
    school: 'Social psychology',
    stardewAnalog: 'Community center / theater',
    intro:
      "Take the stage! When the whole crowd swears the short line is longest, will you agree just to fit in? And when a stern voice tells you to keep going past your comfort — where, exactly, do you stop? We perform these classics here, safely, so you can feel the pull and choose your footing.",
    hookDescription:
      'Judge line lengths while a planted audience answers first — and wrong. No real distress; the ethics overhaul is the lesson.',
    hookKind: 'asch-stage',
    unlockCost: 72,
    palette: {
      wall: '#c0a878', wallDark: '#9e885c', roof: '#7a4a3a', roofDark: '#5c372b',
      door: '#33261a', accent: '#e0c04b',
    },
    lectures: [
      {
        id: 'asch-lines',
        title: "Asch's Line Study: The Power of Conformity",
        blurb:
          "I asked people to judge which line matched a standard — an easy task — but seated them among confederates who confidently gave the *wrong* answer. About a third of the time, real participants caved and agreed with the group against their own eyes. The pull to fit in can override plain perception.",
      },
      {
        id: 'milgram-obedience',
        title: 'Milgram’s Obedience Experiments — and the Ethics Reckoning',
        blurb:
          "Ordinary people, told by an authority to deliver what they believed were dangerous shocks, often obeyed to the very end. No real shocks were given, but the distress to participants was real — and it helped trigger the modern rules of informed consent and ethics review boards. The method is now as instructive as the result.",
      },
      {
        id: 'milgram-situation',
        title: 'Situational Power: When the Setting Shapes the Self',
        blurb:
          "These studies teach a humbling lesson: behavior owes more to the situation than we like to admit. Decent people can do troubling things under the right pressures of role, authority, and setting. (Zimbardo's prison study is our cautionary footnote here — vivid, contested, and a warning about method as much as about human nature.)",
      },
    ],
  },
]

/**
 * Memory Lane (v1.4) — the short street branching north through the gate
 * between Calkins' and Pavlov's. Three shops for the memory researchers;
 * orders continue after Main Street's 14.
 */
export const LANE_BUILDINGS: Building[] = [
  {
    order: 15,
    id: 'ebbinghaus-bakery',
    name: "Ebbinghaus's Forgetting-Curve Bakery",
    figure: 'Hermann Ebbinghaus',
    dates: '1850–1909',
    school: 'Memory (experimental)',
    stardewAnalog: 'Bakery',
    intro:
      "Mind the shelves — everything here goes stale on a schedule I measured personally. In 1885 I taught myself two thousand meaningless syllables, timed my own forgetting, and drew the curve you now walk past daily. Learn today's batch; we'll see what the afternoon leaves you.",
    hookDescription:
      "Memorize the morning batch of nonsense syllables, watch the stock stale on the real 1885 curve, then taste the 'savings' of relearning.",
    hookKind: 'ebbinghaus-recall',
    unlockCost: 90,
    palette: {
      wall: '#e2c58f', wallDark: '#c0a46c', roof: '#9c5d2a', roofDark: '#7a4820',
      door: '#4a3018', accent: '#e8c860',
    },
    lectures: [
      {
        id: 'ebbinghaus-syllables',
        title: 'Nonsense Syllables: Measuring Memory From Scratch',
        blurb:
          "To study pure memory I needed material with no meaning to help it along — so I invented the nonsense syllable: ZOK, BAF, MIB. I was my own only subject, learning list after list to a strict criterion, metronome ticking. Psychology's first rigorous memory experiments were conducted by one very patient man on himself.",
      },
      {
        id: 'ebbinghaus-curve',
        title: 'The Forgetting Curve — Steep, Then Stubborn',
        blurb:
          "Forgetting is fastest in the first hour: barely twenty minutes after learning I retained just 58 percent, and after a day, about a third. But then the curve flattens — what survives the first day tends to survive the month. Memory does not leak steadily; it pours, then drips.",
      },
      {
        id: 'ebbinghaus-savings',
        title: 'Savings: What Relearning Reveals',
        blurb:
          "Even when I could not recall a single syllable of an old list, relearning it took fewer repetitions than the first time — the difference I called savings. Recall is a poor census of what remains; some trace persists below the surface. And lists studied in spaced sittings kept their savings far better than crammed ones.",
      },
    ],
  },
  {
    order: 16,
    id: 'bartlett-stand',
    name: "Bartlett's Story-Swap Stand",
    figure: 'Frederic Bartlett',
    dates: '1886–1969',
    school: 'Memory (reconstructive)',
    stardewAnalog: 'Market stand',
    intro:
      "Step up, step up — one story, freely retold! I hand you 'The War of the Ghosts', you hand it to the next visitor, and we watch what memory does to it. Spoiler from 1932: memory is no gramophone. It is a storyteller with opinions.",
    hookDescription:
      "Read the original tale, then predict how each detail warps across retellings — toward the familiar, never at random.",
    hookKind: 'bartlett-swap',
    unlockCost: 96,
    palette: {
      wall: '#a8bfa0', wallDark: '#879e80', roof: '#5a7a8c', roofDark: '#435d6c',
      door: '#3a3020', accent: '#d8c060',
    },
    lectures: [
      {
        id: 'bartlett-ghosts',
        title: "'The War of the Ghosts': Serial Reproduction",
        blurb:
          "I gave Cambridge students a Native American tale, deliberately far from their world, and had each retell it to the next. Canoes became boats, seal hunts became fishing trips, and the ghosts — the point of the story! — quietly vanished. Each teller reshaped it toward what already made sense to them.",
      },
      {
        id: 'bartlett-schema',
        title: 'Schema Theory and the Effort After Meaning',
        blurb:
          "We meet every new experience with organized past experience — a schema — and remembering is an 'effort after meaning' built from it. Recall is reconstruction: a plausible redrawing from the schema plus a few salvaged details, delivered with full confidence. The feeling of accuracy is not evidence of it.",
      },
      {
        id: 'bartlett-legacy',
        title: 'Why Reconstruction Matters: From My Stand to the Courtroom',
        blurb:
          "If memory rebuilds rather than replays, then every retelling is an opportunity for revision — which is why your best anecdote keeps improving. Decades later my friend down on the main street, Professor Loftus, showed how a single suggestive question exploits exactly this machinery. Treat every vivid memory as a draft, not a document.",
      },
    ],
  },
  {
    order: 17,
    id: 'sperling-kiosk',
    name: "Sperling's Flash-Photo Kiosk",
    figure: 'George Sperling',
    dates: 'b. 1934',
    school: 'Cognitive (iconic memory)',
    stardewAnalog: 'Photo kiosk',
    intro:
      "One flash, nine letters, a twentieth of a second — how many did you catch? Four, you'll say. But in 1960 I rang a bell AFTER the picture vanished and proved you briefly held nearly all of them. Your eyes take a photograph; it just develops and evaporates before you can read it aloud.",
    hookDescription:
      'A letter grid flashes and is gone — report everything, then let the bell cue a single row and feel the difference.',
    hookKind: 'sperling-flash',
    unlockCost: 102,
    palette: {
      wall: '#9aa8b8', wallDark: '#7a8794', roof: '#3a4a5e', roofDark: '#2a3646',
      door: '#26303c', accent: '#d8b84b',
    },
    lectures: [
      {
        id: 'sperling-partial',
        title: 'The Partial-Report Trick',
        blurb:
          "Asked to report a whole flashed grid, people manage about four letters. So I cued them — high, medium, or low tone — AFTER the display vanished, naming one row to report. They could read off almost any row I picked, which means nearly the whole grid was momentarily in there. The bottleneck is the reporting, not the seeing.",
      },
      {
        id: 'sperling-icon',
        title: 'Iconic Memory: A Photograph That Will Not Keep',
        blurb:
          "The visual system holds a brief, high-capacity snapshot of the scene — later christened iconic memory. Delay my cue by even a second and the advantage collapses to ordinary levels: the icon fades in roughly a quarter to half a second. Enormous capacity, hopeless shelf life.",
      },
      {
        id: 'sperling-registers',
        title: 'From Sensory Registers to the Memory Store',
        blurb:
          "The icon is the front porch of memory: a sensory register where everything lands and almost everything is lost. Whatever you attend to gets passed inside to short-term memory, and rehearsal may carry it further still — the multi-store picture Atkinson and Shiffrin assembled in 1968. Attention, not the eyes, decides what you keep.",
      },
    ],
  },
]

/** Every building in town: Main Street west→east, then Memory Lane. */
export const ALL_BUILDINGS: Building[] = [...BUILDINGS, ...LANE_BUILDINGS]

/** The five wandering townsfolk (lighter NPC data). */
export const TOWNSFOLK: Townsperson[] = [
  {
    id: 'anna-freud',
    name: 'Anna Freud',
    dates: '1895–1982',
    blurb:
      "Father mapped the cellar; I tend the nursery. Children's defenses are louder and easier to read.",
    contribution: 'Founded child psychoanalysis; elaborated the defense mechanisms.',
    color: '#9c6ab0',
  },
  {
    id: 'mary-ainsworth',
    name: 'Mary Ainsworth',
    dates: '1913–1999',
    blurb:
      "Watch how the little one greets you after you've stepped away — that reunion tells me everything about their bonds.",
    contribution: 'Devised the Strange Situation and the attachment styles (1970s).',
    color: '#5a9a8a',
  },
  {
    id: 'alfred-adler',
    name: 'Alfred Adler',
    dates: '1870–1937',
    blurb:
      "It isn't your past that defines you, but the goals you lean toward — and whether you feel you *belong*.",
    contribution: 'Founder of individual psychology; inferiority/superiority, social interest.',
    color: '#b07a4a',
  },
  {
    id: 'william-james',
    name: 'William James',
    dates: '1842–1910',
    blurb:
      "Pour yourself a coffee and let the *stream of consciousness* flow — Wundt counts the drops; I taste the river.",
    contribution: "American functionalism's elder statesman; the stream of consciousness.",
    color: '#4a6a9c',
  },
  {
    id: 'leon-festinger',
    name: 'Leon Festinger',
    dates: '1919–1989',
    blurb:
      "I didn't *want* that promotion anyway — see how neatly I just resolved my own dissonance?",
    contribution: 'A walking demo of cognitive dissonance.',
    color: '#a85a5a',
  },
]
