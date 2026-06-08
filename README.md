# Mindhaven 🧠🏘️

A cozy, **Stardew Valley–style pixel-art educational webapp**. Stroll **Wundt
Way**, a single Main Street that is a walkable history of psychology: each of 14
building facades is run by a famous psychologist who greets you in character and
teaches bite-size mini-lectures, with a playful activity drawn from their real
theory. Walking west → east takes you forward in time — from Wundt's 1879 lab
through behaviorism, psychoanalysis, humanism, the cognitive turn, and
(ethics-forward) social psychology.

All pixel art is **generated procedurally in code** (drawn to an HTML5 canvas).
No external/copyrighted assets — original art only.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Production build (type-checked) / preview:

```bash
npm run build    # tsc -b && vite build  — passes clean
npm run preview
npm test         # vitest run — 27 unit tests, all passing
```

Requires Node 22 / npm 10 (developed on those). Stack: **React + TypeScript +
Vite**, plain CSS (no UI framework), **Vitest** (jsdom) for unit tests.

## Controls

| Key | Action |
|-----|--------|
| `WASD` / `↑ ↓ ← →` | Walk the street |
| `E` / `Enter` / `Space` | Enter a building / interact (when the prompt shows) |
| `J` | Open the Insight Journal |
| `Esc` | Close a panel / back out of a lecture |

Walk up to a building facade until the floating **"Press E"** prompt appears.

## Core loop

1. **Walk** Wundt Way; approach a shop → interaction prompt.
2. **Enter** → NPC dialogue panel with the psychologist's portrait, dates,
   school, and an in-character **intro** (typewriter effect). Reading it grants
   **+2 Insight**.
3. **Mini-lectures** (2–3 per building, 42 total) — a titled topic + a faithful
   2–4 sentence blurb in the NPC's voice. Completing one grants **+3 Insight**.
4. **Activity** tab — an interactive beat tied to the building's theory hook
   (see status below). First engagement grants **+4 Insight**.
5. **Insight currency + gating** — later, denser shops are **locked** until you
   bank enough Insight. The Leipzig Lab + Calkins' Reading Room are open from the
   start; the rest unlock progressively (costs ramp 6 → 72 ◆, west → east). The
   HUD shows your Insight, buildings unlocked, and lectures read.
6. **Insight Journal** (`J`) — revisit any unlocked lecture and meet the 5
   wandering townsfolk.
7. **Progress persists** to `localStorage` (`mindhaven.progress.v1`).

## Content

All 14 buildings + 5 townsfolk live in a single typed content file,
[`src/data/buildings.ts`](src/data/buildings.ts), faithful to the design docs
(`Town design.md` / `README.md`): themed name, figure, dates, school, Stardew
analog, in-character intro, hook description, and the mini-lectures. The
ethics-forward framing for Watson/Little Albert and Milgram (and the Zimbardo
footnote) is preserved in the lecture text — no real distress is depicted.

## Status: done vs. stubbed

### Fully interactive activities (6)

| Building | Figure | Activity |
|----------|--------|----------|
| The Leipzig Lab & Town Hall | Wundt | **Reaction-time lamp** — click on flash; false-starts + best-time tracking |
| Calkins' Reading Room | Calkins | **Paired-associate memory** card-match game |
| Pavlov's Provisions | Pavlov | **Ring the bell** — restock + watch the response *extinguish*, re-pair to recover |
| The Skinner Box Arcade | Skinner | **Lever press** under continuous / fixed-ratio / variable-ratio schedules |
| Maslow's Pyramid Bakery | Maslow | **Stack the needs-pyramid** bottom-up; wrong order topples it |
| Kahneman & Tversky's Two-Speed Diner | Kahneman/Tversky | **Fast-vs-slow snap quiz** (bat-and-ball, widgets, Linda) with System 1/2 reveal |

### Hooks as styled stubs (8)

Watson's Nursery, Freud's Couch, Jung's Emporium, Rogers' Inn, Piaget's
Schoolhouse, Bandura's Gym, Loftus' Studio, and Asch & Milgram's Stage show a
**"Hook coming soon"** card with the designed activity description. **Their
intros and all mini-lectures are fully playable** — breadth (all 14 reachable &
readable) was prioritized over deep minigames, per the brief.

### Everything else: done

- All 14 facades render with distinct procedural silhouettes (clock tower,
  awning, saloon, ranch, clinic cross, witch-hat curiosity shop, bakery chimney,
  schoolhouse bell, dumbbell gym, two-awning diner, camera-aperture studio,
  theater curtains), hanging name signs, and a padlock + cost overlay when
  locked.
- Side-scrolling camera, player walk-cycle sprite, 5 wandering townsfolk,
  cozy decor (trees, lamp posts, fences, clouds), crisp integer-scaled pixels.
- Insight currency, progressive unlock gating, locked-building modal, Insight
  Journal (lectures + townsfolk), title screen, localStorage persistence.

## Known limitations / honest notes

- **8 of 14 activity hooks are stubs** (see table). The lectures everywhere are
  complete; only those interactive beats are placeholders.
- **Desktop-first.** Layout is responsive-ish and overlays reflow on small
  screens, but there are **no touch controls** for walking — keyboard required.
- No audio.
- Camera pins vertically (the street is short); it scrolls horizontally only.
- **27 unit tests** (`npm test`) cover the core pure logic — progress reducers
  and gating, `localStorage` hardening, world-placement math, and `shuffle`. The
  React components / canvas rendering are not yet unit-tested; the full loop is
  verified manually in a headless browser (movement → prompt → dialogue →
  lecture → activity → Insight → persistence → journal → gating all confirmed).

## Hardening pass (adversarial audit)

After the initial build, a 5-dimension adversarial audit (correctness, content
accuracy, a11y/UX, TypeScript quality, render/perf) was run, each finding
independently verified before action. Fixes applied:

- **Correctness:** `setTimeout` cleanup on unmount in Lever/Memory/Maslow games;
  clarified that Insight is a **cumulative threshold score, not a spendable
  currency** (unlocking does not deduct it — that would break the escalating
  6 → 72 gates); `loadProgress` now rejects corrupt/tampered storage (clamps
  bad Insight, drops unknown building/lecture ids, survives malformed JSON).
- **Rendering:** backing store now scales by `devicePixelRatio` so pixel art
  stays crisp on Retina/hi-DPI (was upscaled + blurred); 2D context cached
  instead of fetched every frame.
- **Accessibility:** Escape + Tab focus-trap on all modals, keyboard-operable
  typewriter-skip, `:focus-visible` rings, `aria-modal`, status-announced
  interact prompt, Enter/Space to start.
- **Quality:** shared `shuffle`/`useModalKeys` utils (de-duplicated), named
  magic constants, removed an unsafe cast and dead code.

## Project structure

```
src/
  data/        buildings.ts (all content), types.ts
  engine/      world.ts (layout), input.ts, player.ts, townsfolk.ts,
               proximity.ts, progress.ts (Insight + persistence), renderTown.ts,
               shuffle.ts  · *.test.ts (progress, world, shuffle)
  art/         palette.ts, drawTiles.ts, drawBuilding.ts, drawSprites.ts
  hooks/       useGameLoop.ts (rAF loop + camera), useProgress.ts,
               useTypewriter.ts, useModalKeys.ts (Escape + focus-trap)
  components/  TownCanvas, InteractPrompt, HUD, DialoguePanel, LecturePanel,
               LockedModal, Journal, LectureRevisit, TitleScreen, NpcAvatar,
               minigames/ (ReactionGame, MemoryGame, BellGame, LeverGame,
                           MaslowGame, KahnemanGame, HookStub, MinigameHost)
  styles/      global.css, ui.css
```

Many small, focused files (each < ~400 lines); immutable state updates;
TypeScript strict; no `console.log`.
