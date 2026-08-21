<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ code: string }>()
const decoded = decodeURIComponent(props.code || '')
const el = ref<HTMLElement | null>(null)
let observer: MutationObserver | null = null

async function render() {
  try {
    const { default: mermaid } = await import('mermaid')
    const isDark = document.documentElement.classList.contains('dark')
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default', securityLevel: 'loose' })
    const id = `mmd-${Math.random().toString(36).slice(2)}`
    const { svg } = await mermaid.render(id, decoded)
    if (el.value) el.value.innerHTML = svg
  } catch (e) {
    console.error('[Mermaid] render failed:', e)
  }
}

onMounted(() => {
  render()
  // 暗色切换时重渲
  observer = new MutationObserver(() => render())
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div ref="el" class="vp-mermaid">
    <!-- SSR 占位：代码块，爬虫可见；客户端 hydrate 后替换为图 -->
    <div class="vp-block-fallback">
      <pre><code>{{ decoded }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.vp-mermaid {
  margin: 1.5em 0;
}
.vp-mermaid :deep(svg) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
