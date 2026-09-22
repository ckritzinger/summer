<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  score: { type: Number, required: true },
  previousBest: { type: Number, required: true },
})
const emit = defineEmits(['play-again', 'home'])

const isNewBest = props.score > props.previousBest

// --- Continual random confetti bursts ---
const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308', '#14b8a6', '#f472b6', '#22d3ee']

const bursts = ref([])
let burstSeq = 0
let intervalId = null

function spawnBurst() {
  const batch = ++burstSeq
  const originXPct = 10 + Math.random() * 80
  const originYPct = 10 + Math.random() * 70
  const count = 22

  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = 60 + Math.random() * 140
    particles.push({
      id: `${batch}-${i}`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 5 + Math.random() * 7,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance - 30,
      rot: Math.random() * 720 - 360,
      delayMs: Math.round(Math.random() * 80),
    })
  }

  bursts.value = [...bursts.value, { id: batch, xPct: originXPct, yPct: originYPct, particles, launched: false }]

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const burst = bursts.value.find((b) => b.id === batch)
      if (burst) burst.launched = true
    })
  })

  setTimeout(() => {
    bursts.value = bursts.value.filter((b) => b.id !== batch)
  }, 1100)
}

onMounted(() => {
  spawnBurst()
  intervalId = setInterval(spawnBurst, 550)
})
onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-center">
    <!-- Continual confetti bursts scattered across the page -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        v-for="burst in bursts"
        :key="burst.id"
        class="absolute"
        :style="{ left: burst.xPct + '%', top: burst.yPct + '%' }"
      >
        <span
          v-for="p in burst.particles"
          :key="p.id"
          class="absolute left-0 top-0 rounded-sm"
          :style="{
            width: p.size + 'px',
            height: p.size + 'px',
            backgroundColor: p.color,
            opacity: burst.launched ? 0 : 1,
            transform: burst.launched
              ? `translate(${p.tx}px, ${p.ty}px) rotate(${p.rot}deg) scale(0.3)`
              : 'translate(0, 0) rotate(0deg) scale(1)',
            transition: `transform 0.9s cubic-bezier(0.15,0.8,0.25,1) ${p.delayMs}ms, opacity 0.9s ease-in ${p.delayMs}ms`,
          }"
        />
      </div>
    </div>

    <div class="relative z-10 flex flex-col items-center">
      <div class="text-7xl animate-trophyPulse sm:text-8xl">🏆</div>

      <div v-if="isNewBest" class="mt-4 text-lg font-extrabold text-amber-500">🎉 New personal best!</div>
      <div v-else class="mt-4 text-lg font-semibold text-slate-400">Run complete</div>

      <div class="mt-4 text-6xl font-extrabold text-slate-800">{{ score }}</div>
      <p class="mt-2 text-slate-500">
        Previous best: <span class="font-bold text-slate-700">{{ previousBest }}</span>
      </p>

      <div class="mt-8 flex w-full max-w-xs flex-col gap-3">
        <button
          @click="emit('play-again')"
          class="rounded-2xl bg-indigo-500 py-4 text-xl font-extrabold text-white shadow-md transition hover:bg-indigo-600 active:scale-95"
        >
          Play again
        </button>
        <button
          @click="emit('home')"
          class="rounded-2xl bg-white py-3 font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
        >
          Home
        </button>
      </div>
    </div>
  </div>
</template>
