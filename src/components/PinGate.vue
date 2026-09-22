<script setup>
import { ref } from 'vue'

const PIN = '1337'

const emit = defineEmits(['back', 'unlocked'])

const digits = ref('')
const error = ref(false)

function press(d) {
  if (digits.value.length >= 4) return
  digits.value += d
  error.value = false
  if (digits.value.length === 4) check()
}

function check() {
  if (digits.value === PIN) {
    emit('unlocked')
  } else {
    error.value = true
    setTimeout(() => {
      digits.value = ''
    }, 350)
  }
}

function backspace() {
  digits.value = digits.value.slice(0, -1)
  error.value = false
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-10">
    <button
      @click="emit('back')"
      class="self-start rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-500 shadow-sm hover:bg-slate-100"
    >
      ← Back
    </button>

    <h1 class="mt-8 text-lg font-bold text-slate-600">Enter PIN</h1>

    <div class="mt-4 flex gap-3" :class="{ 'animate-shake': error }">
      <span
        v-for="i in 4"
        :key="i"
        class="h-4 w-4 rounded-full border-2"
        :class="[
          i <= digits.length ? (error ? 'border-rose-400 bg-rose-400' : 'border-indigo-400 bg-indigo-400') : 'border-slate-300',
        ]"
      />
    </div>

    <div class="mt-8 grid w-full max-w-xs grid-cols-3 gap-3">
      <button
        v-for="n in ['1','2','3','4','5','6','7','8','9']"
        :key="n"
        @click="press(n)"
        class="aspect-square rounded-2xl bg-white text-xl font-bold text-slate-700 shadow-sm transition active:scale-95 hover:bg-slate-100"
      >
        {{ n }}
      </button>
      <button
        @click="backspace"
        class="aspect-square rounded-2xl bg-white text-lg font-bold text-slate-400 shadow-sm transition active:scale-95 hover:bg-slate-100"
      >
        ⌫
      </button>
      <button
        @click="press('0')"
        class="aspect-square rounded-2xl bg-white text-xl font-bold text-slate-700 shadow-sm transition active:scale-95 hover:bg-slate-100"
      >
        0
      </button>
    </div>
  </div>
</template>
