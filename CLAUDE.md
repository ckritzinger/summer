# × Blitz

Single-page multiplication-facts arcade game. Vue 3 (`<script setup>`) + Tailwind CSS, no backend — all state in `localStorage`. Built with Vite, deployed to GitHub Pages via `.github/workflows/deploy.yml`.

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
- `times-tables-game-spec.md` — original product spec this was built from

## Conventions / things to know
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
Push to `main` → GitHub Actions builds with pnpm and deploys `dist/` to GitHub Pages (repo Pages source must be set to "GitHub Actions"). `vite.config.js` `base` is hardcoded to `/x-blitz/` — update it if the repo is ever renamed.
