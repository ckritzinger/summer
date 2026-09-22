function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pairKey(x, y) {
  return `${x}+${y}`
}

/**
 * Pick the next (x, y) pair for a round. Mutates `usedPairs` (a Set of "x+y" keys).
 * Once every ordered pair in range has been used, the pool resets and repeats
 * are allowed for the rest of the game.
 */
export function nextPair(min, max, usedPairs) {
  const totalPairs = (max - min + 1) ** 2
  if (usedPairs.size >= totalPairs) {
    usedPairs.clear()
  }

  let x, y, key
  // Bounded random retry; falls back to exhaustive scan if unlucky.
  for (let attempt = 0; attempt < 200; attempt++) {
    x = randInt(min, max)
    y = randInt(min, max)
    key = pairKey(x, y)
    if (!usedPairs.has(key)) {
      usedPairs.add(key)
      return { x, y }
    }
  }
  for (let a = min; a <= max; a++) {
    for (let b = min; b <= max; b++) {
      const k = pairKey(a, b)
      if (!usedPairs.has(k)) {
        usedPairs.add(k)
        return { x: a, y: b }
      }
    }
  }
  // Pool exhausted mid-scan (shouldn't happen given the size check above).
  usedPairs.clear()
  usedPairs.add(pairKey(x, y))
  return { x, y }
}

/**
 * Build the 9-button answer grid: 1 correct sum + 8 distractors
 * (a mix of near-miss and random), no duplicate values, correct answer
 * placed at a random position.
 */
export function generateGrid(x, y, min, max) {
  const correct = x + y
  const values = new Set([correct])
  const distractors = []

  const nearMissCandidates = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
    [x - 1, y - 1],
    [x + 1, y + 1],
  ]
    .filter(([a, b]) => a >= min && a <= max && b >= min && b <= max)
    .map(([a, b]) => a + b)
    .filter((v) => v !== correct)

  shuffle(nearMissCandidates)
  const nearMissTarget = randInt(2, 3)
  for (const v of nearMissCandidates) {
    if (distractors.length >= nearMissTarget) break
    if (values.has(v)) continue
    values.add(v)
    distractors.push(v)
  }

  let guard = 0
  while (distractors.length < 8 && guard < 500) {
    guard++
    const a = randInt(min, max)
    const b = randInt(min, max)
    const v = a + b
    if (values.has(v)) continue
    values.add(v)
    distractors.push(v)
  }

  // Extreme fallback for tiny ranges where distinct sums run out:
  // pad with the smallest unused non-negative integers.
  let pad = 0
  while (distractors.length < 8) {
    if (!values.has(pad)) {
      values.add(pad)
      distractors.push(pad)
    }
    pad++
  }

  const buttons = [correct, ...distractors].map((value) => ({ value, correct: value === correct }))
  buttons.sort((a, b) => a.value - b.value)
  return buttons
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
