<script setup>
import { ref } from 'vue'
import { AVATARS } from '../lib/storage.js'
import NumberRain from './NumberRain.vue'

defineProps({
  users: { type: Array, required: true },
})
const emit = defineEmits(['select', 'create'])

const creating = ref(false)
const name = ref('')
const avatar = ref(AVATARS[0])

function startCreate() {
  creating.value = true
  name.value = ''
  avatar.value = AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

function confirmCreate() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('create', { name: trimmed, avatar: avatar.value })
  creating.value = false
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
    <NumberRain />

    <div class="relative z-10 flex w-full flex-col items-center">
      <h1 class="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(99,102,241,0.6)]">
        + Blitz
      </h1>
      <p class="mt-1 text-slate-300">Who's playing?</p>

      <div v-if="!creating" class="mt-8 grid w-full max-w-md grid-cols-2 gap-4 sm:grid-cols-3">
        <button
          v-for="u in users"
          :key="u.id"
          @click="emit('select', u.id)"
          class="flex flex-col items-center gap-2 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur transition hover:shadow-xl active:scale-95"
        >
          <span class="text-4xl">{{ u.avatar }}</span>
          <span class="truncate text-sm font-semibold text-slate-700">{{ u.name }}</span>
          <span class="text-xs text-slate-400">Best {{ u.bestScore }}</span>
        </button>

        <button
          @click="startCreate"
          class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-500/60 bg-slate-950/40 p-4 text-slate-300 backdrop-blur transition hover:border-indigo-400 hover:text-indigo-300"
        >
          <span class="text-4xl">＋</span>
          <span class="text-sm font-semibold">Add player</span>
        </button>
      </div>

      <div v-else class="mt-8 w-full max-w-sm rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur">
        <label class="block text-sm font-semibold text-slate-600">Name</label>
        <input
          v-model="name"
          maxlength="20"
          placeholder="Enter name"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-400 focus:outline-none"
          @keyup.enter="confirmCreate"
        />

        <label class="mt-4 block text-sm font-semibold text-slate-600">Avatar</label>
        <div class="mt-2 grid grid-cols-6 gap-2">
          <button
            v-for="a in AVATARS"
            :key="a"
            @click="avatar = a"
            class="flex h-10 items-center justify-center rounded-lg text-2xl transition"
            :class="avatar === a ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-50 hover:bg-slate-100'"
          >
            {{ a }}
          </button>
        </div>

        <div class="mt-6 flex gap-3">
          <button
            @click="creating = false"
            class="flex-1 rounded-lg bg-slate-100 py-2 font-semibold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            @click="confirmCreate"
            :disabled="!name.trim()"
            class="flex-1 rounded-lg bg-indigo-500 py-2 font-semibold text-white hover:bg-indigo-600 disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
