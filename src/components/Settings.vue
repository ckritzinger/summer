<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  settings: { type: Object, required: true },
})
const emit = defineEmits(['back', 'update-settings'])

const local = reactive({ ...props.settings, roundSeconds: Math.round((props.settings.roundMs ?? 30000) / 1000) })

watch(
  local,
  (val) => {
    const min = Math.max(1, Math.min(Number(val.rangeMin) || 1, 20))
    const max = Math.max(min, Math.min(Number(val.rangeMax) || min, 20))
    const rounds = Math.max(5, Math.min(Number(val.rounds) || 20, 100))
    const roundSeconds = Math.max(3, Math.min(Number(val.roundSeconds) || 30, 60))
    const allowMultipleTries = Boolean(val.allowMultipleTries)
    emit('update-settings', { rangeMin: min, rangeMax: max, rounds, roundMs: roundSeconds * 1000, allowMultipleTries })
  },
  { deep: true },
)
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-10">
    <button
      @click="emit('back')"
      class="self-start rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 shadow-sm hover:bg-slate-100"
    >
      ← Back
    </button>

    <h1 class="mt-4 text-2xl font-extrabold text-slate-800">Settings</h1>

    <div class="mt-6 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <label class="text-sm font-semibold text-slate-600">Number range</label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="local.rangeMin"
            type="number"
            min="1"
            max="20"
            class="w-14 rounded-lg border border-slate-300 px-2 py-1 text-center"
          />
          <span class="text-slate-400">–</span>
          <input
            v-model.number="local.rangeMax"
            type="number"
            min="1"
            max="20"
            class="w-14 rounded-lg border border-slate-300 px-2 py-1 text-center"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <label class="text-sm font-semibold text-slate-600">Rounds per game</label>
        <input
          v-model.number="local.rounds"
          type="number"
          min="5"
          max="100"
          class="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center"
        />
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <label class="text-sm font-semibold text-slate-600">Seconds per round</label>
        <input
          v-model.number="local.roundSeconds"
          type="number"
          min="3"
          max="60"
          class="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center"
        />
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <label class="text-sm font-semibold text-slate-600">Allow multiple tries</label>
        <input v-model="local.allowMultipleTries" type="checkbox" class="h-5 w-5 rounded accent-indigo-500" />
      </div>
    </div>
  </div>
</template>
