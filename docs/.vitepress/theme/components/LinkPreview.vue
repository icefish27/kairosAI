<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, reactive, ref } from 'vue'

const props = withDefaults(defineProps<{
  url: string
  width?: number
  height?: number
  class?: string
}>(), {
  width: 280,
  height: 175,
  class: ''
})

const isVisible = ref(false)
const isLoading = ref(true)
const preview = ref<HTMLElement | null>(null)
const hasPopped = ref(false)

const previewSrc = computed(() => {
  const params = new URLSearchParams({
    url: props.url,
    screenshot: 'true',
    meta: 'false',
    embed: 'screenshot.url',
    colorScheme: 'light',
    'viewport.isMobile': 'true',
    'viewport.deviceScaleFactor': '1',
    'viewport.width': String(props.width * 3),
    'viewport.height': String(props.height * 3)
  })
  return `https://api.microlink.io/?${params.toString()}`
})

const mousePosition = reactive({ x: 0, y: 0 })

const previewStyle = computed<CSSProperties>(() => {
  if (!preview.value) return {}
  const offset = 20
  const pw = props.width
  const ph = props.height
  const vw = window.innerWidth

  let x = mousePosition.x - pw / 2
  x = Math.min(Math.max(8, x), vw - pw - 8)

  const linkRect = preview.value.parentElement?.getBoundingClientRect()
  const y = linkRect ? linkRect.top - ph - offset : 0

  return {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    width: `${pw}px`,
    height: `${ph}px`
  }
})

const popClass = computed(() => (hasPopped.value ? 'lp-pop' : ''))

function handleMouseMove(e: MouseEvent) {
  mousePosition.x = e.clientX
  mousePosition.y = e.clientY
}
function showPreview() {
  isVisible.value = true
  isLoading.value = true
  setTimeout(() => { hasPopped.value = true }, 50)
}
function hidePreview() {
  isVisible.value = false
  hasPopped.value = false
}
function handleImageLoad() {
  isLoading.value = false
}
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener"
    :class="props.class"
    @mousemove="handleMouseMove"
    @mouseenter="showPreview"
    @mouseleave="hidePreview"
  >
    <slot />
  </a>

  <div
    v-if="isVisible"
    ref="preview"
    class="lp-preview"
    :style="previewStyle"
  >
    <div class="lp-inner" :class="popClass">
      <div v-if="isLoading" class="lp-loading">
        <span class="lp-spinner" />
      </div>
      <img
        :src="previewSrc"
        :width="width"
        :height="height"
        class="lp-img"
        alt="预览"
        @load="handleImageLoad"
      />
    </div>
  </div>
</template>

<style scoped>
.lp-preview {
  pointer-events: none;
  z-index: 50;
}

.lp-inner {
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  background: var(--c-card);
  border: 1px solid var(--c-border);
  padding: 4px;
}

.lp-img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
}

.lp-loading {
  position: absolute;
  inset: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg-soft);
  border-radius: 6px;
  z-index: 1;
}

.lp-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-accent);
  border-radius: 50%;
  animation: lp-spin 0.7s linear infinite;
}

@keyframes lp-spin {
  to { transform: rotate(360deg); }
}

.lp-pop {
  animation: lp-pop 600ms ease forwards;
  will-change: transform;
}

@keyframes lp-pop {
  0% { transform: scale(0.4); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  80% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
</style>
