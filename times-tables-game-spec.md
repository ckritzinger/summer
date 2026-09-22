# Times Tables Sprint — Game Spec

## Concept
A single-page web app that drills multiplication facts through fast, arcade-style
rounds. Each round shows a multiplication problem (`x × y`) and a 3×3 grid of
answer buttons. The player taps the correct product before a countdown bar runs
out. Speed and accuracy both matter — score is the time remaining (in ms) at the
moment of a correct answer.

## Core Loop
1. A round begins: `x × y` displayed prominently at the top of the screen.
2. A countdown bar starts, visually depleting.
3. A 3×3 grid of 9 number buttons appears below, one of which is the correct
   product.
4. Player taps a button:
   - **Correct** → score += remaining time (ms) at moment of tap. Brief
     positive feedback animation.
   - **Incorrect** → score += 0. Brief negative feedback animation.
5. Next round loads immediately (no manual "continue" step).
6. After the configured number of rounds, show a final score / summary screen.

## Round Generation
- `x` and `y` are drawn independently from the active number range (see
  Settings). Default range: **1–12**.
- **No repeat pairs within a game**: once an ordered pair `(x, y)` has
  appeared in a round, it cannot be selected again for the rest of that
  game. `(7, 8)` and `(8, 7)` are treated as distinct pairs and can both
  appear.
- **Edge case**: if the active range is small enough that the number of
  rounds requested exceeds the number of available ordered pairs (e.g. a
  1–3 range has only 9 ordered pairs), the pool will be exhausted before
  the game ends. Fallback: once all pairs are used, reset the "used" pool
  and allow repeats for the remainder of the game (rather than crashing or
  cutting the game short).

## Answer Grid (3×3, 9 buttons)
- 1 correct answer (the true product), placed at a random grid position each
  round.
- 8 distractors, generated as a **mix of random + near-miss**:
  - **Near-miss distractors**: products from adjusting one factor by ±1
    (e.g. for `7×8=56`, near-misses include `7×7=49`, `7×9=63`, `6×8=48`,
    `8×8=64`). These are the "plausible mistake" answers that make the game
    pedagogically useful.
  - **Random distractors**: products of other random factor pairs within the
    active range, used to fill remaining slots and keep the grid visually
    varied.
  - No duplicate values in the grid; if a near-miss or random pick collides
    with an existing button value or the correct answer, regenerate.
  - Suggested split: 2–3 near-miss distractors, remainder random. (Exact
    ratio can be tuned once it's playable — treat as a constant to adjust.)

## Timer / Scoring
- Countdown bar starts at **10 seconds** and decays **asymptotically** toward
  zero (fast at first, slowing as it approaches zero) rather than linearly.
- Displayed/used score value = remaining time in milliseconds at the instant
  of a correct tap.
- **Practical floor (assumption — confirm)**: because an asymptotic curve
  never mathematically reaches exactly zero, define a negligible threshold
  (e.g. remaining value < 50ms, or a hard wall-clock cap like 15s real time)
  at which the round auto-resolves as a miss (score 0) and advances to the
  next round. This prevents a round from hanging indefinitely if the player
  doesn't answer.
- Score accumulates across all rounds in the game.

## Game Length
- Default: **20 rounds** per game, configurable.
- Final screen shows total accumulated score (and optionally per-round
  breakdown / average response time — nice-to-have, not required).

## Settings (configurable, default shown)
- Number range: **1–12** (custom min/max, user-settable)
- Rounds per game: **20**
- (Optional, not yet specified) Timer duration, distractor mix ratio

## Visual / Feel
- Should feel "gamey" — energetic, immediate feedback, satisfying
  correct/incorrect animations (e.g. button pulse/flash, color change, score
  pop-up), smooth round-to-round transitions with no dead time.
- Countdown bar should visually communicate urgency as it depletes.
- Exact visual style/theme not yet specified — open for design exploration
  in implementation.

## Fun Mechanics
- **Streak multiplier**: consecutive correct answers increase a score
  multiplier (e.g. 1x → 1.5x → 2x → 2.5x, capped). Any incorrect answer
  resets the streak/multiplier to 1x. The current streak count is displayed
  on screen and grows/pulses visually as it builds — this is the primary
  source of "stakes" and momentum in the game.
- **Feedback juice on correct answers**: button flash/pulse, small particle
  burst, and the score visibly ticking upward — every correct tap should
  have an immediate, satisfying visual hit, not just a silent number change.
- **Personal best framing**: the end-of-game summary compares the current
  run's score against the active user's previous best, rather than showing
  an absolute score in isolation. This is the main hook for replaying.

## User Profiles & Persistence
- All data is stored in **browser local storage** — no backend/server.
- On launch, show a **profile selection screen**: a list of existing local
  users (name + avatar), plus an "Add new user" option.
- Creating a new user: enter a name, pick an avatar from a **preset set of
  icons** (e.g. a small grid of emoji or simple illustrated characters —
  not custom upload/drawing).
- Selecting a user makes them the "active" player; all rounds/scores in the
  session are attributed to that user until they switch profiles.
- Per-user data stored: name, avatar, best score, most recent score (score
  history/trend is a nice-to-have, not required).
- Game settings (number range, rounds per game) are shared/global across
  all users, not per-profile, unless you want them per-user (flag if so).

## Leaderboard
- A dedicated screen, accessible from the profile/home screen, listing
  **all local users with their avatar and best score**, sorted descending.
- Updates live as users play — no need to re-navigate to see a new best
  reflected.

## Explicitly Out of Scope / Undecided
- Persistence of high scores across sessions
- Sound effects/music
- Difficulty progression within a single game (e.g. harder pairs later)
- Multiplayer / leaderboard
- Mobile vs desktop layout specifics
