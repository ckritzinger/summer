<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const FONT_SIZE = 18
const COL_WIDTH = 34
const PALETTE = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308', '#14b8a6', '#f472b6', '#22d3ee']

const canvasEl = ref(null)

let ctx = null
let drops = []
let speeds = []
let columnCount = 0
let rafId = null
let frameCount = 0

function setupCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  columnCount = Math.ceil(canvas.width / COL_WIDTH)
  drops = Array.from({ length: columnCount }, () => Math.random() * -50)
  speeds = Array.from({ length: columnCount }, () => (0.15 + Math.random() * 0.7) * (0.15 + Math.random() * 0.7))
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawFrame() {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return

  frameCount++
  if (frameCount % 3 !== 0) {
    rafId = requestAnimationFrame(drawFrame)
    return
  }

  ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `${FONT_SIZE}px monospace`
  ctx.textAlign = 'center'

  for (let i = 0; i < columnCount; i++) {
    const value = Math.floor(Math.random() * 101)
    ctx.fillStyle = PALETTE[Math.floor(Math.random() * PALETTE.length)]
    ctx.globalAlpha = 0.5 + Math.random() * 0.5
    ctx.fillText(String(value), i * COL_WIDTH + COL_WIDTH / 2, drops[i] * FONT_SIZE)
    ctx.globalAlpha = 1

    if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
      speeds[i] = (0.15 + Math.random() * 0.7) * (0.15 + Math.random() * 0.7)
    }
    drops[i] += speeds[i]
  }

  rafId = requestAnimationFrame(drawFrame)
}

onMounted(() => {
  ctx = canvasEl.value.getContext('2d')
  setupCanvas()
  drawFrame()
  window.addEventListener('resize', setupCanvas)
})
onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', setupCanvas)
})
</script>

<template>
  <canvas ref="canvasEl" class="pointer-events-none absolute inset-0 h-full w-full"></canvas>
</template>
