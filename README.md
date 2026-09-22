# × Blitz

A fast, arcade-style multiplication-facts drill game for the browser. Vue 3 + Tailwind, runs entirely client-side — no backend, no accounts, everything lives in `localStorage`.

## How it plays

- Pick (or create) a local player profile.
- Each round shows a problem (`x × y`) and a 3×3 grid of answer buttons, sorted ascending.
- A countdown bar depletes asymptotically over ~10 seconds — answer fast for more points.
- Correct answers score the remaining time (in ms) at the moment you tap, multiplied by your current streak multiplier (1x → 1.5x → 2x → 2.5x, capped). A wrong answer resets the streak.
- No repeated `(x, y)` pairs within a game until the pool of pairs is exhausted, then repeats are allowed.
- After the configured number of rounds, see your total score against your personal best, and check the leaderboard against other local profiles.

## Tech

- **Vue 3** (`<script setup>`, Composition API) — no router, no state library; a single `screen` ref in `App.vue` drives which screen renders
- **Tailwind CSS** for styling
- **Vite** for dev/build
- **pnpm** for package management
- All persistence is `localStorage` — no server, no network calls

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the printed local URL.

## Build

```bash
pnpm build      # outputs to dist/
pnpm preview    # serve the production build locally
```

## Deploy

Deploys automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`. In the repo settings, set **Pages → Source → GitHub Actions**. The Vite `base` path is set to `/x-blitz/` in `vite.config.js` to match the repo name — update it if the repo is renamed.

## Project structure

```
src/
  App.vue                 # screen state machine
  components/
    ProfileSelect.vue     # "who's playing" screen, profile create
    Home.vue               # per-player home, start game / leaderboard
    PinGate.vue             # PIN-gated entry to settings
    Settings.vue           # number range / rounds-per-game config
    Game.vue               # core round loop, timer, scoring, streak, confetti
    Summary.vue            # end-of-game score vs. personal best
    Leaderboard.vue        # all local players sorted by best score
    NumberRain.vue         # shared canvas background effect
  lib/
    storage.js             # localStorage read/write for users & settings
    roundGen.js             # round pair + answer-grid generation
```

## Spec

The original product spec this game was built against is in `times-tables-game-spec.md`.
