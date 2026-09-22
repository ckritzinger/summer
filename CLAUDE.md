# + Blitz

Single-page addition-facts arcade game for young kids (~ages 5–7). Forked from `x-blitz` (multiplication version) — same mechanics, easier defaults (see Conventions below). Vue 3 (`<script setup>`) + Tailwind CSS, no backend — all state in `localStorage`. Built with Vite, deployed to GitHub Pages via `.github/workflows/deploy.yml`.

## Stack
- Vue 3 SFCs, Composition API, `<script setup>`
- Tailwind CSS (utility classes only, no component library)
- Vite build, `pnpm` package manager
- No router — `App.vue` is a hand-rolled state machine (a `screen` ref: `'profiles' | 'home' | 'pin' | 'settings' | 'game' | 'summary' | 'leaderboard'`), switched with `v-if`/`v-else-if`

## Structure
- `src/App.vue` — top-level screen switch + wiring between `src/lib/storage.js` and the screen components
- `src/components/` — one component per screen (`ProfileSelect`, `Home`, `PinGate`, `Settings`, `Game`, `Summary`, `Leaderboard`), plus `NumberRain.vue` (shared canvas background effect, used on `Home` and `ProfileSelect`)
- `src/lib/storage.js` — all `localStorage` read/write (users, settings, active user id)
- `src/lib/roundGen.js` — round/answer-grid generation logic (pure functions, no Vue)
- `addition-blitz-game-spec.md` — product spec this was built from (adapted from the multiplication original for young kids)

## Conventions / things to know
- **Operation is addition (`x + y`), not multiplication** — `roundGen.js` computes sums, not products. This game is a fork of `x-blitz`; keep that in mind if porting fixes between the two, the arithmetic differs everywhere `x * y` used to be.
- **Audience is ~5–7 year olds**, so defaults are deliberately easier than the original: number range **1–5** (not 1–12), round timer **30s** (not 10s, i.e. 3x), and **multiple tries on by default** (a wrong tap doesn't end the round — see below). Don't quietly tighten these back toward the original's defaults.
- **Multiple tries setting** (`allowMultipleTries` in settings/storage, `Game.vue`): when on, a wrong tap adds the button's value to `wrongAttempts` (marks it dead/greyed, breaks streak) but does **not** call `resolveRound` — the round keeps running until a correct tap or the timer's auto-miss fires. When off, any tap (right or wrong) resolves the round immediately, matching the original one-shot behavior.
- **Round timer is configurable** (`roundMs` in settings/storage, seconds in the Settings UI). `HALF_LIFE_MS` and `AUTO_MISS_ELAPSED_MS` in `Game.vue` are derived as fixed ratios of `roundMs` (0.3x and 1.5x respectively) rather than hardcoded, so the decay curve/hard-cap feel stays proportional at any duration.
- **No router, no store library.** Screen transitions are plain refs emitted up to `App.vue`. Keep it that way unless the screen graph gets meaningfully more complex.
- **Settings are gated behind a hardcoded PIN (`1337`)** in `PinGate.vue` — intentional, not a real auth boundary.
- **Answer grid is sorted ascending**, not randomly placed (changed from the original spec's "random position" — user preference, confirmed).
- **Countdown timer decays asymptotically** (exponential half-life, not linear) per spec — see `HALF_LIFE_MS` in `Game.vue`.
- **Streak bar is `fixed` to the viewport bottom** in `Game.vue`, with a permanently-reserved bottom padding on the page (not conditional) — this was a deliberate fix so the bar appearing/disappearing never reflows the answer grid, and never overlaps it. Don't reintroduce inline/conditional spacing for it.
- **Grid buttons are keyed by `roundIndex-index`, not by value.** This was a deliberate fix for a mobile bug: keying by value let Vue reuse a DOM node across rounds when the same number reappeared, which carried over sticky `:hover`/`:active` CSS from the previous tap. Keep the round-scoped key.
- **Confetti bursts are done with plain JS-driven inline `transform`/`opacity` CSS transitions (double-`requestAnimationFrame` to force a paint before flipping state), not `@keyframes` referencing CSS custom properties.** The keyframe+`var()` approach was tried first and silently failed (particles rendered as a static dot, never animated) — don't revert to it.
- `NumberRain.vue` is a self-contained canvas component (sizes itself off `canvas.parentElement`) — reuse it rather than duplicating the rain logic if a third screen wants the effect.
- Mobile viewport handling: game screen uses `min-h-[100dvh]` and `env(safe-area-inset-bottom)`-aware padding to avoid the browser chrome covering the answer grid.

## Commands
```bash
pnpm install
pnpm dev       # local dev server
pnpm build     # production build to dist/
pnpm preview   # preview the production build
```

## Deploy
Push to `main` → GitHub Actions builds with pnpm and deploys `dist/` to GitHub Pages (repo Pages source must be set to "GitHub Actions"). `vite.config.js` `base` is hardcoded to `/sum-blitz/` — update it if the repo is ever renamed.
