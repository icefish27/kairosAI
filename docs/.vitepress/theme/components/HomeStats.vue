<script setup lang="ts">
import { usePosts } from '../composables/usePosts'
import { ref, onMounted, onUnmounted } from 'vue'

const { stats } = usePosts()
const s = stats

// count-up 动画
const display = ref({ count: 0, tagCount: 0, days: 0, words: 0 })
let raf = 0
onMounted(() => {
  const dur = 1200
  const start = performance.now()
  const from = { count: 0, tagCount: 0, days: 0, words: 0 }
  const to = {
    count: s.value.count,
    tagCount: s.value.tagCount,
    days: s.value.days,
    words: s.value.words
  }
  const step = (t: number) => {
    const p = Math.min(1, (t - start) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    display.value = {
      count: Math.round(from.count + (to.count - from.count) * e),
      tagCount: Math.round(from.tagCount + (to.tagCount - from.tagCount) * e),
      days: Math.round(from.days + (to.days - from.days) * e),
      words: Math.round(from.words + (to.words - from.words) * e)
    }
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})
onUnmounted(() => cancelAnimationFrame(raf))

const fmtW = (n: number) => (n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n))
</script>

<template>
  <section class="stats">
    <div class="stat">
      <div class="num">{{ display.count }}</div>
      <div class="label">文章</div>
    </div>
    <div class="stat">
      <div class="num">{{ display.tagCount }}</div>
      <div class="label">标签</div>
    </div>
    <div class="stat">
      <div class="num">{{ display.days }}</div>
      <div class="label">持续更新天数</div>
    </div>
    <div class="stat">
      <div class="num">{{ fmtW(display.words) }}</div>
      <div class="label">累计字数</div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: var(--c-bg-alt);
  color: #fff;
  border-radius: var(--r-lg);
  overflow: hidden;
}
.stat {
  text-align: center;
  padding: 32px 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
.stat:last-child {
  border-right: none;
}
.num {
  font-size: 2.2em;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-accent-soft);
}
.label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 6px;
}
@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat:nth-child(2) {
    border-right: none;
  }
  .stat:nth-child(1),
  .stat:nth-child(2) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
