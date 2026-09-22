<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { nextPair, generateGrid } from '../lib/roundGen.js'

const props = defineProps({
  rangeMin: { type: Number, required: true },
  rangeMax: { type: Number, required: true },
  rounds: { type: Number, required: true },
  roundMs: { type: Number, required: true },
  allowMultipleTries: { type: Boolean, required: true },
})
const emit = defineEmits(['finish'])

// Decay rate and hard cap scale with roundMs, keeping the same feel as the
// original fixed-10s round (3s half-life, 15s hard cap) at any duration.
const HALF_LIFE_MS = props.roundMs * 0.3
const AUTO_MISS_ELAPSED_MS = props.roundMs * 1.5
const AUTO_MISS_REMAINING_MS = 50 // negligible-threshold floor

const MULTIPLIERS = [1, 1.5, 2, 2.5]

const STREAK_THEMES = [
  { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300' },
  { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300' },
  { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-300' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', ring: 'ring-fuchsia-300' },
  { bg: 'bg-purple-100', text: 'text-purple-700', ring: 'ring-purple-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-300' },
  { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-300' },
]

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308', '#14b8a6']

const usedPairs = new Set()
const roundIndex = ref(0)
const totalScore = ref(0)
const streak = ref(0)

const x = ref(0)
const y = ref(0)
const buttons = ref([])
const remainingMs = ref(props.roundMs)
const wrongAttempts = ref(new Set()) // values tried and wrong this round (multi-try mode)
const locked = ref(false) // true while a tap's feedback is resolving
const feedback = reactive({ id: null, correct: null }) // per-button feedback
const roundResult = ref(null) // 'correct' | 'incorrect' | null, drives screen flash
const lastGain = ref(0)
const showGain = ref(false)
const particles = ref([])
const confettiLaunched = ref(false)
const confettiOrigin = reactive({ x: 0, y: 0 })
const rootEl = ref(null)

let roundStartTime = 0
let rafId = null
let particleSeq = 0

const currentMultiplier = computed(() => MULTIPLIERS[Math.min(streak.value, MULTIPLIERS.length - 1)])
const barPercent = computed(() => Math.max(0, Math.min(100, (remainingMs.value / props.roundMs) * 100)))
const barColor = computed(() => {
  const pct = barPercent.value
  if (pct > 50) return 'bg-emerald-400'
  if (pct > 20) return 'bg-amber-400'
  return 'bg-rose-500'
})
const streakTheme = computed(() => STREAK_THEMES[(Math.max(streak.value, 1) - 1) % STREAK_THEMES.length])

function burstConfetti(originEvent) {
  if (originEvent?.currentTarget && rootEl.value) {
    const btnRect = originEvent.currentTarget.getBoundingClientRect()
    const rootRect = rootEl.value.getBoundingClientRect()
    confettiOrigin.x = btnRect.left + btnRect.width / 2 - rootRect.left
    confettiOrigin.y = btnRect.top + btnRect.height / 2 - rootRect.top
  }

  const batch = ++particleSeq
  const count = 60
  const next = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = 160 + Math.random() * 260
    const size = 6 + Math.random() * 8
    next.push({
      id: `${batch}-${i}`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 60,
      rot: Math.random() * 1080 - 540,
      delayMs: Math.round(Math.random() * 100),
    })
  }
  confettiLaunched.value = false
  particles.value = next

  // Paint the particles at their start position first, then flip to the
  // end position on the next frame so the CSS transition actually runs.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (particleSeq === batch) confettiLaunched.value = true
    })
  })

  setTimeout(() => {
    if (particleSeq === batch) particles.value = []
  }, 1000)
}

function startRound() {
  const pair = nextPair(props.rangeMin, props.rangeMax, usedPairs)
  x.value = pair.x
  y.value = pair.y
  buttons.value = generateGrid(pair.x, pair.y, props.rangeMin, props.rangeMax)
  remainingMs.value = props.roundMs
  wrongAttempts.value = new Set()
  roundStartTime = performance.now()
  locked.value = false
  roundResult.value = null
  feedback.id = null
  feedback.correct = null
  tick()
}

function tick() {
  const elapsed = performance.now() - roundStartTime
  const remaining = props.roundMs * Math.pow(0.5, elapsed / HALF_LIFE_MS)
  remainingMs.value = remaining

  if (locked.value) return

  if (remaining < AUTO_MISS_REMAINING_MS || elapsed > AUTO_MISS_ELAPSED_MS) {
    resolveRound(null, false)
    return
  }
  rafId = requestAnimationFrame(tick)
}

function handleTap(button, event) {
  if (locked.value || wrongAttempts.value.has(button.value)) return
  event?.currentTarget?.blur()

  if (!button.correct && props.allowMultipleTries) {
    // Wrong guess, but tries are unlimited: mark it dead, break the streak,
    // and let the timer keep running instead of ending the round.
    wrongAttempts.value.add(button.value)
    if (streak.value > 0) streak.value = 0
    feedback.id = button.value
    feedback.correct = false
    setTimeout(() => {
      if (feedback.id === button.value) {
        feedback.id = null
        feedback.correct = null
      }
    }, 300)
    return
  }

  resolveRound(button, button.correct, event)
}

function resolveRound(tappedButton, isCorrect, event) {
  locked.value = true
  if (rafId) cancelAnimationFrame(rafId)

  feedback.id = tappedButton ? tappedButton.value : null
  feedback.correct = isCorrect

  if (isCorrect) {
    const gain = Math.round(remainingMs.value * currentMultiplier.value)
    totalScore.value += gain
    lastGain.value = gain
    streak.value += 1
    roundResult.value = 'correct'
    burstConfetti(event)
  } else {
    lastGain.value = 0
    streak.value = 0
    roundResult.value = 'incorrect'
  }

  showGain.value = true
  setTimeout(() => {
    showGain.value = false
  }, 700)

  setTimeout(() => {
    roundIndex.value += 1
    if (roundIndex.value >= props.rounds) {
      emit('finish', totalScore.value)
    } else {
      startRound()
    }
  }, 450)
}

onMounted(startRound)
onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div
    ref="rootEl"
    class="relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-4 pt-4 transition-colors duration-200"
    :class="roundResult === 'incorrect' ? 'bg-rose-50' : 'bg-slate-50'"
    style="padding-bottom: max(7rem, env(safe-area-inset-bottom) + 6rem)"
  >
    <!-- Confetti burst, emanates from the tapped button -->
    <div
      class="pointer-events-none absolute z-20"
      :style="{ left: confettiOrigin.x + 'px', top: confettiOrigin.y + 'px' }"
    >
      <span
        v-for="p in particles"
        :key="p.id"
        class="absolute left-0 top-0 rounded-sm"
        :style="{
          width: p.size + 'px',
          height: p.size + 'px',
          backgroundColor: p.color,
          opacity: confettiLaunched ? 0 : 1,
          transform: confettiLaunched
            ? `translate(${p.tx}px, ${p.ty}px) rotate(${p.rot}deg) scale(0.3)`
            : 'translate(0, 0) rotate(0deg) scale(1)',
          transition: `transform 0.9s cubic-bezier(0.15,0.8,0.25,1) ${p.delayMs}ms, opacity 0.9s ease-in ${p.delayMs}ms`,
        }"
      />
    </div>

    <!-- Top bar: progress + score + streak -->
    <div class="flex w-full max-w-sm items-center justify-between text-sm font-semibold text-slate-500">
      <span>Round {{ Math.min(roundIndex + 1, rounds) }} / {{ rounds }}</span>
      <span class="relative text-slate-700">
        Score: {{ totalScore }}
        <span
          v-if="showGain && lastGain > 0"
          class="pointer-events-none absolute -right-2 top-0 -translate-y-full text-emerald-500 animate-floatUp"
        >
          +{{ lastGain }}
        </span>
      </span>
    </div>

    <!-- Problem -->
    <div class="mt-4 text-5xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
      {{ x }} + {{ y }}
    </div>

    <!-- Countdown bar -->
    <div class="mt-4 h-3 w-full max-w-sm overflow-hidden rounded-full bg-slate-200">
      <div
        class="h-full rounded-full transition-[width] duration-75 ease-linear"
        :class="barColor"
        :style="{ width: barPercent + '%' }"
      />
    </div>

    <!-- Answer grid -->
    <div class="mt-5 grid w-full max-w-xs grid-cols-3 gap-2.5">
      <button
        v-for="(btn, i) in buttons"
        :key="`${roundIndex}-${i}`"
        :disabled="locked || wrongAttempts.has(btn.value)"
        @click="handleTap(btn, $event)"
        class="aspect-square rounded-2xl text-xl font-bold shadow-sm transition-all duration-150 sm:text-2xl"
        :class="[
          feedback.id === btn.value && feedback.correct
            ? 'bg-emerald-400 text-white animate-pop'
            : feedback.id === btn.value && !feedback.correct
              ? 'bg-rose-400 text-white animate-shake'
              : locked && btn.correct
                ? 'bg-emerald-200 text-emerald-800'
                : wrongAttempts.has(btn.value)
                  ? 'bg-slate-200 text-slate-500 line-through'
                  : 'bg-white text-slate-800 hover:bg-indigo-50 active:scale-95',
        ]"
      >
        {{ btn.value }}
      </button>
    </div>

    <!-- Streak bar: fixed to the bottom so it never shifts the layout above -->
    <div
      v-if="streak > 0"
      :key="streak"
      class="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom) + 0.5rem)"
    >
      <div
        class="flex w-full max-w-md flex-col items-center gap-1 rounded-2xl px-5 py-2.5 shadow-lg ring-2 animate-streakPulse"
        :class="[streakTheme.bg, streakTheme.text, streakTheme.ring]"
      >
        <div class="text-lg font-extrabold sm:text-xl">{{ streak }} streak · {{ currentMultiplier }}x</div>
        <div class="flex w-full justify-center gap-0.5 overflow-hidden whitespace-nowrap text-xs leading-none">
          <span v-for="i in streak" :key="i">🔥</span>
        </div>
      </div>
    </div>
  </div>
</template>
