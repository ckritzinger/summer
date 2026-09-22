<script setup>
import { computed } from 'vue'

const props = defineProps({
  users: { type: Array, required: true },
  activeUserId: { type: String, default: null },
})
const emit = defineEmits(['back'])

const sorted = computed(() => [...props.users].sort((a, b) => b.bestScore - a.bestScore))

const medals = ['🥇', '🥈', '🥉']
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-10">
    <button
      @click="emit('back')"
      class="self-start rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 shadow-sm hover:bg-slate-100"
    >
      ← Back
    </button>

    <h1 class="mt-4 text-2xl font-extrabold text-slate-800">🏆 Leaderboard</h1>

    <div class="mt-6 w-full max-w-md space-y-2">
      <div
        v-for="(u, i) in sorted"
        :key="u.id"
        class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
        :class="u.id === activeUserId ? 'ring-2 ring-indigo-400' : ''"
      >
        <span class="w-8 text-center text-lg font-bold text-slate-400">{{ medals[i] || i + 1 }}</span>
        <span class="text-3xl">{{ u.avatar }}</span>
        <span class="flex-1 truncate font-semibold text-slate-700">{{ u.name }}</span>
        <span class="font-extrabold text-indigo-500">{{ u.bestScore }}</span>
      </div>

      <p v-if="sorted.length === 0" class="mt-6 text-center text-slate-400">No players yet.</p>
    </div>
  </div>
</template>
