<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ code: string }>()
const decoded = decodeURIComponent(props.code || '')
const el = ref<HTMLElement | null>(null)
let chart: any = null
let observer: MutationObserver | null = null

function parseOption(): any {
  try {
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

async function render() {
  const opt = parseOption()
  if (!opt) {
    console.error('[EChart] invalid JSON option')
    return
  }
  const echarts = await import('echarts')
  if (chart) chart.dispose()
  chart = echarts.init(el.value!, document.documentElement.classList.contains('dark') ? 'dark' : null, {
    renderer: 'canvas'
  })
  chart.setOption(opt)
  chart.resize()
}

function onResize() {
  chart?.resize()
}

onMounted(() => {
  render()
  window.addEventListener('resize', onResize)
  observer = new MutationObserver(() => render())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  observer?.disconnect()
  chart?.dispose()
})
</script>

<template>
  <div ref="el" class="vp-echart">
    <!-- SSR 占位 -->
    <div class="vp-block-fallback">
      <pre><code>{{ decoded }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.vp-echart {
  margin: 1.5em 0;
  width: 100%;
  height: 360px;
  position: relative;
}
.vp-echart :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
</style>
