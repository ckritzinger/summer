<script setup>
import NumberRain from './NumberRain.vue'

defineProps({
  user: { type: Object, required: true },
})
const emit = defineEmits(['start', 'leaderboard', 'switch-user', 'settings'])
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center overflow-hidden bg-slate-950 px-4 py-10">
    <NumberRain />

    <button
      @click="emit('switch-user')"
      class="relative z-10 self-start rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur hover:bg-white"
    >
      ← Switch player
    </button>

    <button
      @click="emit('settings')"
      aria-label="Settings"
      class="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
        <path
          fill-rule="evenodd"
          d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.243.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.274.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.274.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <div class="relative z-10 mt-6 flex flex-col items-center">
      <span class="text-5xl">{{ user.avatar }}</span>
      <h1 class="mt-2 text-2xl font-extrabold text-white drop-shadow-[0_2px_12px_rgba(99,102,241,0.6)]">
        Hey, {{ user.name }}!
      </h1>
      <p class="mt-1 text-slate-300">Best score: <span class="font-bold text-indigo-300">{{ user.bestScore }}</span></p>
    </div>

    <button
      @click="emit('start')"
      class="relative z-10 mt-10 w-full max-w-sm rounded-2xl bg-indigo-500 py-4 text-xl font-extrabold text-white shadow-md transition hover:bg-indigo-600 active:scale-95"
    >
      ▶ Start Game
    </button>

    <button
      @click="emit('leaderboard')"
      class="relative z-10 mt-3 w-full max-w-sm rounded-2xl bg-white/95 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
    >
      🏆 Leaderboard
    </button>
  </div>
</template>
