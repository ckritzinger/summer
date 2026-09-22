# + Blitz — Game Spec

> Adapted from the original multiplication game (`x-blitz`) for a much younger
> audience — roughly **ages 5–7**, just learning to add small numbers. Same
> core mechanics, tuned easier: smaller number range, more time per round, and
> unlimited guesses by default so one slip doesn't end the round.

## Concept
A single-page web app that drills addition facts through fast, arcade-style
rounds. Each round shows an addition problem (`x + y`) and a 3×3 grid of
answer buttons. The player taps the correct sum before a countdown bar runs
out. Speed and accuracy both matter — score is the time remaining (in ms) at
the moment of a correct answer.

## Core Loop
1. A round begins: `x + y` displayed prominently at the top of the screen.
2. A countdown bar starts, visually depleting.
3. A 3×3 grid of 9 number buttons appears below, one of which is the correct
   sum.
4. Player taps a button:
   - **Correct** → score += remaining time (ms) at moment of tap. Brief
     positive feedback animation.
   - **Incorrect** → depends on the **multiple tries** setting (see
     Settings): either the round ends immediately (score += 0), or the
     button is marked dead and the player keeps guessing until they find the
     right one or the timer runs out.
5. Next round loads immediately (no manual "continue" step).
6. After the configured number of rounds, show a final score / summary screen.

## Round Generation
- `x` and `y` are drawn independently from the active number range (see
  Settings). Default range: **1–5** — small, friendly sums for early
  learners (largest possible answer is 10).
- **No repeat pairs within a game**: once an ordered pair `(x, y)` has
  appeared in a round, it cannot be selected again for the rest of that
  game. `(2, 3)` and `(3, 2)` are treated as distinct pairs and can both
  appear.
- **Edge case**: if the active range is small enough that the number of
  rounds requested exceeds the number of available ordered pairs, the pool
  will be exhausted before the game ends. Fallback: once all pairs are used,
  reset the "used" pool and allow repeats for the remainder of the game
  (rather than crashing or cutting the game short).

## Answer Grid (3×3, 9 buttons)
- 1 correct answer (the true sum), placed at a random grid position each
  round.
- 8 distractors, generated as a **mix of random + near-miss**:
  - **Near-miss distractors**: sums from adjusting one addend by ±1 (e.g.
    for `3+4=7`, near-misses include `3+3=6`, `3+5=8`, `2+4=6`, `4+4=8`).
    These are the "plausible mistake" answers that make the game
    pedagogically useful.
  - **Random distractors**: sums of other random addend pairs within the
    active range, used to fill remaining slots and keep the grid visually
    varied.
  - No duplicate values in the grid; if a near-miss or random pick collides
    with an existing button value or the correct answer, regenerate.
  - Suggested split: 2–3 near-miss distractors, remainder random.

## Timer / Scoring
- Countdown bar starts at the configured round duration (default **30
  seconds** — 3x longer than the original 10s multiplication pace, to give
  young kids room to count on their fingers) and decays **asymptotically**
  toward zero (fast at first, slowing as it approaches zero) rather than
  linearly.
- Displayed/used score value = remaining time in milliseconds at the instant
  of a correct tap.
- A negligible threshold (remaining value < 50ms) or a hard wall-clock cap
  (1.5x the round duration) auto-resolves the round as a miss (score 0) and
  advances to the next round, so it never hangs indefinitely.
- Score accumulates across all rounds in the game.

## Multiple Tries (setting)
- **Default: on.** A wrong tap marks that button dead (greyed out,
  struck-through) and breaks the current streak, but the round keeps
  running — the player can keep tapping other buttons until they land on the
  correct sum or the timer runs out. This keeps young kids from feeling
  "punished" out of a round by one wrong guess.
- **Off**: reverts to the original one-shot behavior — any tap, right or
  wrong, immediately ends the round.

## Game Length
- Default: **20 rounds** per game, configurable.
- Final screen shows total accumulated score.

## Settings (configurable, default shown)
- Number range: **1–5** (custom min/max, user-settable)
- Rounds per game: **20**
- Seconds per round: **30** (3–60s range)
- Allow multiple tries: **on**

## Visual / Feel
- Should feel "gamey" — energetic, immediate feedback, satisfying
  correct/incorrect animations (button pulse/flash, color change, score
  pop-up), smooth round-to-round transitions with no dead time.
- Countdown bar should visually communicate urgency as it depletes.

## Fun Mechanics
- **Streak multiplier**: consecutive correct first-guesses increase a score
  multiplier (1x → 1.5x → 2x → 2.5x, capped). Any incorrect answer resets the
  streak/multiplier to 1x. The current streak count is displayed on screen
  and grows/pulses visually as it builds.
- **Feedback juice on correct answers**: button flash/pulse, small particle
  burst, and the score visibly ticking upward.
- **Personal best framing**: the end-of-game summary compares the current
  run's score against the active user's previous best.

## User Profiles & Persistence
- All data is stored in **browser local storage** — no backend/server.
- On launch, show a **profile selection screen**: a list of existing local
  users (name + avatar), plus an "Add new user" option.
- Creating a new user: enter a name, pick an avatar from a preset set of
  emoji icons.
- Selecting a user makes them the "active" player; all rounds/scores in the
  session are attributed to that user until they switch profiles.
- Per-user data stored: name, avatar, best score, most recent score.
- Game settings (number range, rounds, timer, multiple tries) are
  shared/global across all users, not per-profile.

## Leaderboard
- A dedicated screen, accessible from the profile/home screen, listing all
  local users with their avatar and best score, sorted descending.
- Updates live as users play.

## Explicitly Out of Scope / Undecided
- Persistence of high scores across sessions
- Sound effects/music
- Difficulty progression within a single game (e.g. harder pairs later)
- Multiplayer / leaderboard
- Mobile vs desktop layout specifics
